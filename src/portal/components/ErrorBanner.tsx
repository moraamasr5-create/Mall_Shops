"use client";

import { PortalApiError } from "@/portal/api/types";

// يحوّل رسائل الـ API التقنية إلى نص يفهمه صاحب الصالون (Frontend فقط — بلا تغيير Backend).
function userFacingMessage(error: PortalApiError): string {
  const msg = error.message.toLowerCase();
  if (
    error.code === "UNAUTHENTICATED" ||
    msg.includes("invalid login credentials") ||
    msg.includes("invalid credentials")
  ) {
    return "البريد الإلكتروني أو كلمة المرور غير صحيحة. تحقق منهما ثم حاول مرة أخرى.";
  }
  if (error.code === "VALIDATION_ERROR" && msg.includes("slug")) {
    return "تعذّر إنشاء الصالون بهذا الاسم. جرّب اسمًا آخر أو أعد المحاولة.";
  }
  if (msg.includes("email rate limit") || msg.includes("rate limit")) {
    return "محاولات كثيرة الآن. انتظر قليلاً ثم حاول مرة أخرى.";
  }
  // إن كانت الرسالة عربية أو واضحة بما يكفي نعرضها كما هي
  return error.message;
}

// يعرض خطأ الـ API للمستخدم؛ requestId للمساعدة فقط عند الحاجة دون إرباك.
export function ErrorBanner({ error }: { error: unknown }) {
  if (!error) return null;

  if (error instanceof PortalApiError) {
    return (
      <div className="portal-error" role="alert">
        <div>{userFacingMessage(error)}</div>
        {error.requestId ? (
          <div>
            <code>مرجع للمساعدة: {error.requestId}</code>
          </div>
        ) : null}
      </div>
    );
  }

  const message = error instanceof Error ? error.message : "حدث خطأ ما. حاول مرة أخرى.";
  return (
    <div className="portal-error" role="alert">
      {message}
    </div>
  );
}
