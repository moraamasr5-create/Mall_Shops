import Link from "next/link";

export default function HomePage() {
  return (
    <div className="portal-home">
      <h1>مول شوبس</h1>
      <p>بوابة المالك لصالونك — استخدم المنتج دون أدوات المطورين.</p>
      <ul>
        <li>
          <Link href="/signup">إنشاء حساب</Link>
        </li>
        <li>
          <Link href="/login">تسجيل الدخول</Link>
        </li>
      </ul>
      <p style={{ color: "#5c6570", fontSize: "0.9rem" }}>
        مرجع واجهة البرمجة يبقى على <code>/api/v1</code> للمشغّلين.
      </p>
    </div>
  );
}
