"use client";

import { PortalApiError } from "@/portal/api/types";

function hasArabic(text: string): boolean {
  return /[\u0600-\u06FF]/.test(text);
}

// يحوّل رسائل الـ API التقنية إلى نص يفهمه صاحب الصالون + خطوة تالية واضحة.
// Frontend فقط — بلا تغيير Backend. requestId يبقى للمطور عبر «مرجع للمساعدة».
function userFacingMessage(error: PortalApiError): string {
  const msg = error.message.toLowerCase();

  if (
    error.code === "UNAUTHENTICATED" ||
    msg.includes("invalid login credentials") ||
    msg.includes("invalid credentials") ||
    msg.includes("invalid or expired")
  ) {
    return "البريد الإلكتروني أو كلمة المرور غير صحيحة. تحقق منهما ثم حاول مرة أخرى.";
  }

  if (
    msg.includes("confirm email") ||
    msg.includes("email not confirmed") ||
    msg.includes("no session was returned")
  ) {
    return "تعذّر إكمال التسجيل الآن بسبب إعداد تأكيد البريد. تواصل مع الدعم وأرسل مرجع المساعدة إن ظهر.";
  }

  if (
    msg.includes("already registered") ||
    msg.includes("user already") ||
    msg.includes("already exists")
  ) {
    return "هذا البريد مسجّل مسبقًا. جرّب تسجيل الدخول، أو استخدم بريدًا آخر.";
  }

  if (msg.includes("email rate limit") || msg.includes("rate limit")) {
    return "محاولات كثيرة الآن. انتظر قليلاً ثم حاول مرة أخرى.";
  }

  if (error.code === "CONFLICT" || msg.includes("slug already exists")) {
    return "تعذّر إنشاء الصالون بهذا الاسم. جرّب اسمًا مختلفًا قليلاً ثم أعد المحاولة.";
  }

  if (error.code === "VALIDATION_ERROR" || msg.includes("validation failed")) {
    return "بعض البيانات غير صالحة. راجع الحقول ثم أعد المحاولة.";
  }

  if (error.code === "PERMISSION_DENIED" || error.status === 403) {
    return "ليس لديك صلاحية لإكمال هذه العملية. سجّل الخروج ثم الدخول من جديد، أو تواصل مع الدعم.";
  }

  if (error.status === 404 || msg.includes("not found") || msg.includes("فشل الطلب (404)")) {
    return "تعذّر إكمال العملية الآن. أعد المحاولة بعد لحظات، وإن استمر سجّل الخروج ثم الدخول من جديد.";
  }

  if (error.status >= 500 || error.code === "INTERNAL_ERROR" || error.code === "CONFIG_ERROR") {
    return "حدث خطأ في الخادم. أعد المحاولة بعد قليل، وإن استمر أرسل مرجع المساعدة للدعم.";
  }

  if (error.code === "NETWORK_ERROR") {
    return error.message;
  }

  // رسالة إنجليزية/تقنية غير معروفة — لا نعرضها كنص رئيسي للمالك
  if (!hasArabic(error.message)) {
    return "حدث خطأ أثناء العملية. أعد المحاولة، وإن استمر أرسل مرجع المساعدة للدعم.";
  }

  return error.message;
}

// يعرض خطأ الـ API للمستخدم؛ requestId للمطور دون إرباك.
export function ErrorBanner({ error }: { error: unknown }) {
  if (!error) return null;

  if (error instanceof PortalApiError) {
    const facing = userFacingMessage(error);
    const showTechnical =
      !hasArabic(error.message) &&
      error.message.trim().length > 0 &&
      facing !== error.message;

    return (
      <div className="portal-error" role="alert">
        <div>{facing}</div>
        {error.requestId ? (
          <div>
            <code>مرجع للمساعدة: {error.requestId}</code>
          </div>
        ) : null}
        {showTechnical ? (
          <div>
            <code>{error.message}</code>
          </div>
        ) : null}
      </div>
    );
  }

  const message =
    error instanceof Error ? error.message : "حدث خطأ ما. حاول مرة أخرى.";
  return (
    <div className="portal-error" role="alert">
      {hasArabic(message)
        ? message
        : "حدث خطأ ما. حاول مرة أخرى، وإن استمر سجّل الخروج ثم الدخول من جديد."}
    </div>
  );
}
