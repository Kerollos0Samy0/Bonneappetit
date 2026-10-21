/**
 * Utility to compress images client-side using HTML5 Canvas.
 * Keeps image quality high while reducing size to ~30-80KB to fit easily in localStorage.
 */
export function compressImageFile(file, maxWidth = 800, maxHeight = 800, quality = 0.8) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      reject(new Error('الملف المختار ليس صورة صالحة'));
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target.result;

      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate aspect-preserving dimensions
        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        // High quality rendering
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      };

      img.onerror = (err) => reject(new Error('فشل تحميل الصورة للمعالجة'));
    };

    reader.onerror = (err) => reject(new Error('فشل قراءة ملف الصورة'));
  });
}

/**
 * Curated preset food photos for Bonne Appetit dishes.
 * Ready-to-use appetizing photos if the admin doesn't have a photo on hand.
 */
export const PRESET_FOOD_IMAGES = [
  {
    id: 'vine_leaves',
    title: 'ورق عنب ومحاشي',
    url: 'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'meat_kofta',
    title: 'كفتة حاتي ومشاوي',
    url: 'https://images.unsplash.com/photo-1529042410759-befb1204b468?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'beef_burger',
    title: 'برجر لحم بلدي',
    url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'chicken_strips',
    title: 'استربس ودجاج كرسبي',
    url: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'chicken_pane',
    title: 'بانيه دجاج متبل',
    url: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'shish_tawook',
    title: 'شيش طاووق فراخ',
    url: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'shrimp',
    title: 'جمبري متبل مقشر',
    url: 'https://images.unsplash.com/photo-1559742811-822873691df8?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'fish_fillet',
    title: 'سمك فيليه وكفتة سمك',
    url: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'hawawshi',
    title: 'حواوشي بلدي',
    url: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'sambousek',
    title: 'سمبوسك ومقبلات',
    url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'mombar',
    title: 'ممبار بلدي محشي',
    url: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'vegetables_tagine',
    title: 'خضار وطواجن نباتية',
    url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'bonne_box',
    title: 'بوكس بونابيتي الرسمي',
    url: '/images/cover.png'
  },
  {
    id: 'bonne_tray',
    title: 'تجهيزات المطبخ الفاخرة',
    url: '/images/WhatsApp Image 2024-08-29 at 10.28.47 AM.jpeg'
  }
];
