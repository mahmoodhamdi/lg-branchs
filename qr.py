import qrcode
from PIL import Image, ImageDraw, ImageFont
import os
from typing import Optional, Tuple
import io
import base64

class CustomQRGenerator:
    def __init__(self):
        self.qr_codes = []
    
    def create_qr_code(self, 
                      data: str,
                      logo_path: Optional[str] = None,
                      # QR Code settings
                      version: int = 1,
                      error_correction: str = 'H',
                      box_size: int = 10,
                      border: int = 4,
                      # Colors
                      fill_color: str = 'black',
                      back_color: str = 'white',
                      # Logo settings
                      logo_size_ratio: float = 0.3,
                      logo_border: bool = True,
                      logo_border_color: str = 'white',
                      logo_border_width: int = 4,
                      # Output settings
                      output_size: Tuple[int, int] = (400, 400),
                      output_path: Optional[str] = None,
                      # Additional customization
                      corner_radius: int = 0,
                      gradient: bool = False,
                      gradient_colors: Optional[Tuple[str, str]] = None) -> Image.Image:
        """
        إنشاء QR code مخصص مع إمكانيات متقدمة
        
        Parameters:
        - data: البيانات المراد تشفيرها
        - logo_path: مسار اللوجو (يجب أن يكون PNG)
        - version: حجم QR code (1-40)
        - error_correction: مستوى تصحيح الأخطاء ('L', 'M', 'Q', 'H')
        - box_size: حجم كل مربع في QR code
        - border: سماكة الحدود
        - fill_color: لون QR code
        - back_color: لون الخلفية
        - logo_size_ratio: نسبة حجم اللوجو (0.1-0.4)
        - logo_border: إضافة حدود حول اللوجو
        - output_size: حجم الصورة النهائية
        - output_path: مسار حفظ الملف
        - corner_radius: انحناء الزوايا
        - gradient: استخدام تدرج لوني
        """
        
        # إعداد مستوى تصحيح الأخطاء
        error_levels = {
            'L': qrcode.constants.ERROR_CORRECT_L,
            'M': qrcode.constants.ERROR_CORRECT_M,
            'Q': qrcode.constants.ERROR_CORRECT_Q,
            'H': qrcode.constants.ERROR_CORRECT_H
        }
        
        # إنشاء QR code
        qr = qrcode.QRCode(
            version=version,
            error_correction=error_levels.get(error_correction, qrcode.constants.ERROR_CORRECT_H),
            box_size=box_size,
            border=border,
        )
        
        qr.add_data(data)
        qr.make(fit=True)
        
        # إنشاء صورة QR code
        if gradient and gradient_colors:
            qr_img = self._create_gradient_qr(qr, gradient_colors, back_color)
        else:
            qr_img = qr.make_image(fill_color=fill_color, back_color=back_color)
        
        qr_img = qr_img.convert('RGB')
        
        # تطبيق الزوايا المنحنية إذا طُلبت
        if corner_radius > 0:
            qr_img = self._apply_rounded_corners(qr_img, corner_radius)
        
        # إضافة اللوجو إذا تم توفيره
        if logo_path and os.path.exists(logo_path):
            qr_img = self._add_logo(qr_img, logo_path, logo_size_ratio, 
                                 logo_border, logo_border_color, logo_border_width)
        
        # تغيير حجم الصورة النهائية
        qr_img = qr_img.resize(output_size, Image.Resampling.LANCZOS)
        
        # حفظ الملف إذا تم تحديد مسار
        if output_path:
            qr_img.save(output_path, quality=95)
            print(f"تم حفظ QR code في: {output_path}")
        
        # حفظ في التاريخ
        self.qr_codes.append({
            'data': data,
            'image': qr_img,
            'settings': {
                'logo_path': logo_path,
                'fill_color': fill_color,
                'back_color': back_color,
                'size': output_size
            }
        })
        
        return qr_img
    
    def _create_gradient_qr(self, qr, gradient_colors, back_color):
        """إنشاء QR code بتدرج لوني"""
        # الحصول على مصفوفة QR code
        qr_array = qr.get_matrix()
        
        # إنشاء صورة فارغة
        img_size = (len(qr_array[0]) * qr.box_size, len(qr_array) * qr.box_size)
        img = Image.new('RGB', img_size, back_color)
        draw = ImageDraw.Draw(img)
        
        # إنشاء التدرج
        for i, row in enumerate(qr_array):
            for j, cell in enumerate(row):
                if cell:
                    x = j * qr.box_size
                    y = i * qr.box_size
                    
                    # حساب لون التدرج حسب الموقع
                    ratio = (i + j) / (len(qr_array) + len(row))
                    color = self._interpolate_color(gradient_colors[0], gradient_colors[1], ratio)
                    
                    draw.rectangle([x, y, x + qr.box_size, y + qr.box_size], fill=color)
        
        return img
    
    def _interpolate_color(self, color1, color2, ratio):
        """حساب اللون المتوسط بين لونين"""
        if isinstance(color1, str):
            color1 = tuple(int(color1[i:i+2], 16) for i in (1, 3, 5))
        if isinstance(color2, str):
            color2 = tuple(int(color2[i:i+2], 16) for i in (1, 3, 5))
        
        r = int(color1[0] + (color2[0] - color1[0]) * ratio)
        g = int(color1[1] + (color2[1] - color1[1]) * ratio)
        b = int(color1[2] + (color2[2] - color1[2]) * ratio)
        
        return (r, g, b)
    
    def _apply_rounded_corners(self, img, radius):
        """تطبيق زوايا منحنية"""
        # إنشاء mask للزوايا المنحنية
        mask = Image.new('L', img.size, 0)
        draw = ImageDraw.Draw(mask)
        draw.rounded_rectangle([0, 0, img.size[0], img.size[1]], radius=radius, fill=255)
        
        # تطبيق الـ mask
        result = Image.new('RGBA', img.size, (0, 0, 0, 0))
        result.paste(img, mask=mask)
        
        return result
    
    def _add_logo(self, qr_img, logo_path, size_ratio, add_border, border_color, border_width):
        """إضافة اللوجو في منتصف QR code"""
        try:
            # فتح اللوجو (يجب أن يكون PNG)
            logo = Image.open(logo_path)
            
            # حساب حجم اللوجو
            qr_width, qr_height = qr_img.size
            logo_size = int(min(qr_width, qr_height) * size_ratio)
            
            # تغيير حجم اللوجو مع الحفاظ على النسب
            logo = logo.resize((logo_size, logo_size), Image.Resampling.LANCZOS)
            
            # إضافة حدود بيضاء حول اللوجو إذا طُلبت
            if add_border:
                border_size = logo_size + (border_width * 2)
                bordered_logo = Image.new('RGB', (border_size, border_size), border_color)
                
                logo_pos = ((border_size - logo_size) // 2, (border_size - logo_size) // 2)
                if logo.mode == 'RGBA':
                    bordered_logo.paste(logo, logo_pos, logo)
                else:
                    bordered_logo.paste(logo, logo_pos)
                
                logo = bordered_logo
            
            # وضع اللوجو في المنتصف
            logo_pos = ((qr_width - logo.size[0]) // 2, (qr_height - logo.size[1]) // 2)
            
            if logo.mode == 'RGBA':
                qr_img.paste(logo, logo_pos, logo)
            else:
                qr_img.paste(logo, logo_pos)
            
        except Exception as e:
            print(f"خطأ في إضافة اللوجو: {e}")
        
        return qr_img
    
    def create_batch_qr_codes(self, urls_list, logo_path=None, **kwargs):
        """إنشاء مجموعة من QR codes"""
        results = []
        for i, url in enumerate(urls_list):
            output_path = kwargs.get('output_path', f'qr_code_{i+1}.png')
            if isinstance(output_path, str) and not output_path.endswith(f'_{i+1}.png'):
                name, ext = os.path.splitext(output_path)
                output_path = f"{name}_{i+1}{ext}"
            
            qr_img = self.create_qr_code(url, logo_path=logo_path, output_path=output_path, **kwargs)
            results.append(qr_img)
        
        return results
    
    def save_as_base64(self, qr_img):
        """تحويل QR code إلى base64"""
        buffer = io.BytesIO()
        qr_img.save(buffer, format='PNG')
        img_str = base64.b64encode(buffer.getvalue()).decode()
        return f"data:image/png;base64,{img_str}"
    
    def get_history(self):
        """الحصول على تاريخ QR codes المُنشأة"""
        return self.qr_codes

# مثال على الاستخدام
if __name__ == "__main__":
    # إنشاء مولد QR code
    qr_gen = CustomQRGenerator()
    
    # بيانات المثال - رابط موقعك
    url = "https://mahmoodhamdi.github.io/lg-branchs.io/"
    
    # إنشاء QR code أساسي
    print("إنشاء QR code أساسي...")
    basic_qr = qr_gen.create_qr_code(
        data=url,
        output_path="basic_qr.png"
    )
    
    # QR code مخصص مع لوجو (إذا كان متوفراً)
    print("إنشاء QR code مخصص مع لوجو...")
    custom_qr = qr_gen.create_qr_code(
        data=url,
        logo_path="logo-lg.png",  # مسار لوجو LG بصيغة PNG
        fill_color="#1f2937",  # لون داكن
        back_color="#f3f4f6",  # خلفية فاتحة
        logo_size_ratio=0.25,
        logo_border=True,
        logo_border_color="white",
        logo_border_width=5,
        output_size=(500, 500),
        corner_radius=20,
        output_path="custom_lg_qr.png"
    )
    
    # QR code بتدرج لوني
    print("إنشاء QR code بتدرج لوني...")
    gradient_qr = qr_gen.create_qr_code(
        data=url,
        logo_path="logo-lg.png",  # مسار لوجو LG بصيغة PNG
        gradient=True,
        gradient_colors=("#3b82f6", "#8b5cf6"),  # أزرق إلى بنفسجي
        back_color="white",
        logo_size_ratio=0.2,
        output_size=(600, 600),
        corner_radius=30,
        output_path="gradient_lg_qr.png"
    )
    
    # مجموعة QR codes لروابط متعددة
    urls_list = [
        "https://mahmoodhamdi.github.io/lg-branchs/",
        "https://lg.com",
        "https://lg.com/support"
    ]
    
    print("إنشاء مجموعة QR codes...")
    batch_qrs = qr_gen.create_batch_qr_codes(
        urls_list,
        logo_path="logo-lg.png",  # مسار لوجو LG بصيغة PNG
        fill_color="#dc2626",  # أحمر LG
        back_color="white",
        logo_size_ratio=0.25,
        output_size=(400, 400)
    )
    
    # عرض تاريخ العمليات
    history = qr_gen.get_history()
    print(f"\nتم إنشاء {len(history)} QR codes")
    
    print("\nتم الانتهاء! تحقق من الملفات المُنشأة.")