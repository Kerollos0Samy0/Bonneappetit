import * as XLSX from 'xlsx';

/**
 * Standard column headers for Excel sheet (Arabic & English mappings)
 */
export const EXCEL_COLUMNS = [
  { key: 'id', header: 'كود الصنف (ID)', width: 14 },
  { key: 'name', header: 'اسم الصنف', width: 28 },
  { key: 'category', header: 'القسم', width: 14 },
  { key: 'price', header: 'سعر البيع العادي (قطاعي)', width: 22 },
  { key: 'wholesalePrice', header: 'سعر التجار (جملة)', width: 18 },
  { key: 'stock', header: 'الرصيد بالمخزن (طبق)', width: 20 },
  { key: 'unit', header: 'الوحدة والتعبئة', width: 22 },
  { key: 'weightKg', header: 'الوزن (كجم)', width: 14 },
  { key: 'isFasting', header: 'أكل صيامي (نعم/لا)', width: 16 },
  { key: 'isSpecial', header: 'سبشيال (نعم/لا)', width: 16 },
  { key: 'hidden', header: 'حالة العرض (معروض/مخفي)', width: 22 },
  { key: 'description', header: 'الوصف وطريقة التسوية', width: 40 }
];

/**
 * Export current inventory & products catalog to an Excel .xlsx file
 */
export function exportInventoryToExcel(products = [], inventory = {}, wholesaleDiscountPct = 15) {
  // 1. Build rows data
  const rows = products.map((product) => {
    const stockQty = inventory[product.id] ?? 0;
    const retailPrice = Number(product.price) || 0;
    const merchantPrice = (product.wholesalePrice !== undefined && product.wholesalePrice !== null && Number(product.wholesalePrice) > 0)
      ? Number(product.wholesalePrice)
      : Math.round(retailPrice * (1 - (wholesaleDiscountPct || 15) / 100));
    
    // Convert category ID to readable Arabic name
    let categoryName = product.category;
    if (product.category === 'special') categoryName = 'سبشيال';
    else if (product.category === 'fish') categoryName = 'سمك';
    else if (product.category === 'poultry') categoryName = 'دواجن';
    else if (product.category === 'beef') categoryName = 'لحوم';
    else if (product.category === 'vegetables') categoryName = 'خضار';

    return {
      'كود الصنف (ID)': product.id,
      'اسم الصنف': product.name || '',
      'القسم': categoryName,
      'سعر البيع العادي (قطاعي)': retailPrice,
      'سعر التجار (جملة)': merchantPrice,
      'الرصيد بالمخزن (طبق)': Number(stockQty) || 0,
      'الوحدة والتعبئة': product.unit || 'طبق نصف كيلو',
      'الوزن (كجم)': Number(product.weightKg) || 0.5,
      'أكل صيامي (نعم/لا)': product.isFasting ? 'نعم' : 'لا',
      'سبشيال (نعم/لا)': product.isSpecial ? 'نعم' : 'لا',
      'حالة العرض (معروض/مخفي)': product.hidden ? 'مخفي' : 'معروض',
      'الوصف وطريقة التسوية': product.description || ''
    };
  });

  // 2. Create workbook and worksheet
  const worksheet = XLSX.utils.json_to_sheet(rows);

  // Set column widths
  worksheet['!cols'] = EXCEL_COLUMNS.map((col) => ({ wch: col.width }));

  // Enable RTL on sheet so Arabic displays cleanly in Excel
  if (!worksheet['!views']) worksheet['!views'] = [];
  worksheet['!views'].push({ rightToLeft: true });

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'مخزن بونابيتي');

  // 3. Generate file name with today's date
  const now = new Date();
  const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const fileName = `Bonne_Appetit_Inventory_${dateStr}.xlsx`;

  // 4. Download file
  XLSX.writeFile(workbook, fileName);
  return fileName;
}

/**
 * Parse an uploaded Excel / CSV file and detect changes compared to current inventory
 */
export async function parseInventoryExcelFile(file, existingProducts = [], existingInventory = {}) {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('لم يتم اختيار ملف'));
      return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });

        // Get first sheet
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        if (!worksheet) {
          throw new Error('الملف فارغ أو لا يحتوي على صفحات بيانات صالحة');
        }

        // Convert sheet to JSON rows
        const rawRows = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        if (!rawRows || rawRows.length === 0) {
          throw new Error('لم يتم العثور على أي صفوف أو بيانات داخل الشيت');
        }

        const updates = [];
        const errors = [];

        rawRows.forEach((row, index) => {
          const rowNum = index + 2; // header is row 1

          // Find values using multiple possible column header variants
          const id = String(
            row['كود الصنف (ID)'] || row['كود الصنف'] || row['ID'] || row['id'] || row['الكود'] || ''
          ).trim();

          const name = String(
            row['اسم الصنف'] || row['الاسم'] || row['Name'] || row['name'] || ''
          ).trim();

          if (!name && !id) {
            // empty row, skip
            return;
          }

          // Category parsing
          const rawCat = String(row['القسم'] || row['Category'] || row['category'] || '').trim().toLowerCase();
          let category = 'special';
          if (rawCat.includes('سمك') || rawCat.includes('fish')) category = 'fish';
          else if (rawCat.includes('فراخ') || rawCat.includes('دواجن') || rawCat.includes('chicken') || rawCat.includes('poultry')) category = 'poultry';
          else if (rawCat.includes('لحم') || rawCat.includes('beef') || rawCat.includes('meat')) category = 'beef';
          else if (rawCat.includes('خضار') || rawCat.includes('نباتي') || rawCat.includes('محاشي') || rawCat.includes('veg')) category = 'vegetables';
          else if (rawCat.includes('سبشيال') || rawCat.includes('special')) category = 'special';

          // Regular Price parsing
          const rawPrice = row['سعر البيع العادي (قطاعي)'] || row['سعر البيع (ج.م)'] || row['سعر البيع'] || row['السعر'] || row['سعر القطاعي'] || row['Price'] || row['price'] || 0;
          const price = parseFloat(rawPrice);
          if (isNaN(price) || price < 0) {
            errors.push(`السطر ${rowNum}: سعر البيع العادي غير صحيح (${rawPrice})`);
            return;
          }

          // Wholesale / Merchant Price parsing
          const rawWholesale = row['سعر التجار (جملة)'] || row['سعر التجار'] || row['سعر الجملة'] || row['Wholesale Price'] || row['wholesalePrice'] || row['Wholesale'] || row['الجملة'];
          let wholesalePrice;
          if (rawWholesale !== undefined && rawWholesale !== '') {
            const parsedW = parseFloat(rawWholesale);
            wholesalePrice = (!isNaN(parsedW) && parsedW >= 0) ? parsedW : Math.round(price * 0.85);
          } else if (existing?.wholesalePrice !== undefined && existing?.wholesalePrice !== null) {
            wholesalePrice = Number(existing.wholesalePrice);
          } else {
            wholesalePrice = Math.round(price * 0.85);
          }

          // Stock parsing
          const rawStock = row['الرصيد بالمخزن (طبق)'] || row['الرصيد بالمخزن'] || row['الرصيد'] || row['المخزن'] || row['Stock'] || row['stock'] || 0;
          const stock = parseInt(rawStock, 10);
          if (isNaN(stock) || stock < 0) {
            errors.push(`السطر ${rowNum}: رصيد المخزن غير صحيح (${rawStock})`);
            return;
          }

          // Unit & Weight
          const unit = String(row['الوحدة والتعبئة'] || row['الوحدة'] || row['Unit'] || row['unit'] || 'طبق نصف كيلو').trim();
          const rawWeight = row['الوزن (كجم)'] || row['الوزن'] || row['Weight'] || row['weight'] || 0.5;
          const weightKg = parseFloat(rawWeight) || 0.5;

          // Flags
          const rawFasting = String(row['أكل صيامي (نعم/لا)'] || row['صيامي'] || row['نباتي'] || row['Fasting'] || '').trim().toLowerCase();
          const isFasting = rawFasting === 'نعم' || rawFasting === 'yes' || rawFasting === 'true' || rawFasting === '1';

          const rawSpecial = String(row['سبشيال (نعم/لا)'] || row['سبشيال'] || row['Special'] || '').trim().toLowerCase();
          const isSpecial = rawSpecial === 'نعم' || rawSpecial === 'yes' || rawSpecial === 'true' || rawSpecial === '1';

          const rawHidden = String(row['حالة العرض (معروض/مخفي)'] || row['حالة العرض'] || row['مخفي'] || row['Hidden'] || '').trim().toLowerCase();
          const hidden = rawHidden === 'مخفي' || rawHidden === 'hidden' || rawHidden === 'yes' || rawHidden === 'true';

          const description = String(row['الوصف وطريقة التسوية'] || row['الوصف'] || row['Description'] || row['description'] || '').trim();

          // Check if item exists in existing products
          const existing = existingProducts.find((p) => p.id === id || p.name.trim().toLowerCase() === name.toLowerCase());

          const targetId = existing ? existing.id : (id || 'prod_' + Date.now() + '_' + index);
          const oldStock = existing ? (existingInventory[existing.id] ?? 0) : 0;
          const oldPrice = existing ? existing.price : 0;
          const oldWholesalePrice = existing?.wholesalePrice !== undefined && existing?.wholesalePrice !== null
            ? Number(existing.wholesalePrice)
            : Math.round(oldPrice * 0.85);
          const oldName = existing ? existing.name : '';

          const stockChanged = !existing || oldStock !== stock;
          const priceChanged = !existing || oldPrice !== price;
          const wholesalePriceChanged = !existing || oldWholesalePrice !== wholesalePrice;
          const nameChanged = !existing || oldName !== name;

          const updatedProduct = {
            ...(existing || {}),
            id: targetId,
            name: name || existing?.name || 'صنف جديد',
            category: category || existing?.category || 'special',
            price,
            wholesalePrice,
            unit,
            weightKg,
            description: description || existing?.description || '',
            image: existing?.image || '',
            isFasting,
            isSpecial,
            hidden
          };

          updates.push({
            rowNum,
            isNew: !existing,
            targetId,
            product: updatedProduct,
            oldStock,
            newStock: stock,
            oldPrice,
            newPrice: price,
            oldWholesalePrice,
            newWholesalePrice: wholesalePrice,
            stockChanged,
            priceChanged,
            wholesalePriceChanged,
            nameChanged,
            hasAnyChange: stockChanged || priceChanged || wholesalePriceChanged || nameChanged || !existing
          });
        });

        resolve({
          totalRows: rawRows.length,
          updates,
          errors
        });
      } catch (err) {
        reject(new Error(err.message || 'فشل في قراءة ملف الإكسيل. تأكد من صحة تنسيق الشيت.'));
      }
    };

    reader.onerror = () => reject(new Error('حدث خطأ أثناء فتح الملف'));
    reader.readAsArrayBuffer(file);
  });
}
