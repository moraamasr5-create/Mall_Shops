/**
 * محرك النصائح الذكي (Smart Care Engine)
 * يعمل محلياً بالكامل بدون استخدام أي API خارجي أو استهلاك إنترنت.
 * يعتمد على خدمة العميل المختارة لتوليد نصائح مخصصة.
 * 
 * @param {string} serviceId معرّف الخدمة
 * @returns {string[]} مصفوفة من النصائح 
 */
export function getSmartCareTips(serviceId) {
    switch (serviceId) {
      case 'haircut':
        return ['تجنب غسل الشعر بالماء الساخن جداً للحفاظ على صحة البصيلات.'];
      case 'beard':
        return ['استخدم زيت اللحية يومياً للترطيب وتخفيف الحكة.', 'مشط اللحية بانتظام لتوجيه نمو الشعر.'];
      case 'blowdry':
        return ['استخدم سيروم حماية من الحرارة قبل الاستشوار القادم.', 'تجنب ربط الشعر بقوة بعد الاستشوار لمنع التكسر.'];
      case 'facial':
        return ['تجنب التعرض المباشر للشمس لمدة 24 ساعة.', 'استخدم مرطب خفيف ومناسب لنوع بشرتك يومياً.'];
      case 'coloring':
        return ['استخدم شامبو خالٍ من السلفات للحفاظ على اللون.', 'قلل من غسيل الشعر بالماء الساخن لمنع بهتان الصبغة.'];
      default:
        return [];
    }
  }
  
  /**
   * جلب وتجميع جميع النصائح من مصفوفة خدمات بدون أي تكرار
   * @param {string[]} serviceIds مصفوفة من معرّفات الخدمات
   * @returns {string[]} مصفوفة النصائح المجمعة
   */
  export function getCombinedCareTips(serviceIds) {
    const tipsSet = new Set();
    
    serviceIds.forEach(id => {
      const tips = getSmartCareTips(id);
      tips.forEach(tip => tipsSet.add(tip));
    });
    
    return Array.from(tipsSet);
  }
