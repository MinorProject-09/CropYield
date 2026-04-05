import { Link, useNavigate, useParams } from "react-router-dom";
import { HiOutlineArrowLeft, HiOutlineInformationCircle } from "react-icons/hi2";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { useLanguage } from "../i18n/LanguageContext";
import { getCropInfo } from "../data/cropInfo";

function SectionCard({ title, children }) {
  return (
    <section className="rounded-3xl border border-green-200 bg-green-50/80 p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900 mb-3">{title}</h2>
      <div className="space-y-3 text-sm text-gray-700">{children}</div>
    </section>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="space-y-1">
      <div className="text-xs uppercase tracking-wider text-gray-500">{label}</div>
      <div className="rounded-2xl bg-white p-3 text-sm leading-relaxed text-gray-700 border border-gray-200">{value || t("Not available yet.")}</div>
    </div>
  );
}

function ListSection({ label, items }) {
  const normalizedItems = Array.isArray(items) ? items : [];
  return (
    <div className="space-y-2">
      <div className="text-xs uppercase tracking-wider text-gray-500">{label}</div>
      {normalizedItems.length > 0 ? (
        <ul className="list-inside list-disc rounded-2xl bg-white p-4 text-sm text-gray-700 border border-gray-200 space-y-2">
          {normalizedItems.map((item, index) => (
            <li key={`${label}-${index}`}>{item}</li>
          ))}
        </ul>
      ) : (
        <div className="rounded-2xl bg-white p-4 text-sm text-gray-500 border border-gray-200">{t("No details available yet.")}</div>
      )}
    </div>
  );
}

export default function CropDetailPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { cropName } = useParams();

  const decodedCrop = decodeURIComponent(cropName || "").trim();
  const cropKey = decodedCrop.toLowerCase().replace(/\s+/g, " ");
  const info = getCropInfo(cropKey);

  return (
    <div className="min-h-screen bg-green-100 dark:bg-slate-900 font-[Outfit,system-ui,sans-serif] text-gray-900 dark:text-slate-100">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-10">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 rounded-full border border-green-200 bg-white px-4 py-2 text-sm font-semibold text-green-700 shadow-sm transition hover:bg-green-50"
            >
              <HiOutlineArrowLeft className="h-4 w-4" />
              {t("Back")}
            </button>
          </div>
          <img src={info?.image} alt={decodedCrop} className="w-auto h- max-w-[50%] object-contain drop-shadow" />

          <div className="w-full sm:w-auto sm:max-w-sm rounded-3xl border border-green-200 bg-white p-5 shadow-lg">

            <div className="flex items-center justify-center gap-4 text-xl font-bold text-gray-900">
              <span className="capitalize">{decodedCrop || t("Crop Details")}</span>
            </div>
            <p className="mt-4 px-2 text-center text-sm font-medium leading-relaxed text-gray-500">
              {info
                ? t("Complete crop guide including sowing, harvesting, seed selection, fertilizers and pesticides.")
                : t("Detailed guide for this crop is not available yet. Explore other crops or return to prediction.")}
            </p>
          </div>
        </div>

        {!info ? (
          <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center text-gray-700 shadow-sm">
            <p className="text-lg font-semibold text-red-700">{t("Crop guide unavailable")}</p>
            <p className="mt-2 text-sm text-gray-600">
              {t("We don’t have a structured guide for this crop yet. Please return to prediction and try another crop.")}
            </p>
            <Link to="/prediction" className="mt-4 inline-flex rounded-full bg-green-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-green-800">
              {t("Back to prediction")}
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
            <div className="space-y-6">
              <div className="rounded-3xl border border-green-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3 text-sm uppercase tracking-widest text-green-700">
                  <HiOutlineInformationCircle className="h-5 w-5" />
                  <span>{t("Crop overview")}</span>
                </div>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <DetailRow label={t("Season")} value={t(info.season)} />
                  <DetailRow label={t("Water requirement")} value={t(info.water)} />
                  <DetailRow label={t("Ideal pH")} value={t(info.ph)} />
                  <DetailRow label={t("Growing duration")} value={`${info.days} ${t("days")}`} />
                </div>
                <div className="mt-5 rounded-3xl border border-gray-200 bg-green-50 p-4 text-sm text-gray-700">
                  <span className="font-semibold">{t("Quick tip")}:</span> {t(info.tip)}
                </div>
              </div>

              <SectionCard title={t("Equipment")}>
                <ListSection label={t("Equipment and their usage during growing and harvesting")} items={(info.equipment || []).map(item => t(item))} />
              </SectionCard>

              <SectionCard title={t("Sowing")}>
                <DetailRow label={t("When to sow")} value={t(info.sow || "Not specified.")} />
                <ListSection label={t("How to sow")} items={(info.howToSow || []).map(item => t(item))} />
              </SectionCard>

              <SectionCard title={t("Harvesting")}>
                <DetailRow label={t("When to harvest")} value={t(info.harvest || "Not specified.")} />
                <ListSection label={t("How to harvest")} items={(info.howToHarvest || []).map(item => t(item))} />
              </SectionCard>

              <SectionCard title={t("Seeds and varieties")}>
                <ListSection label={t("Recommended seed types")} items={(info.seedTypes || []).map(item => t(item))} />
                <DetailRow label={t("Why these seeds")} value={t(info.seedBenefits || "Not specified.")} />
              </SectionCard>

              <SectionCard title={t("Fertilizer and pest management")}>
                <ListSection label={t("Fertilizers")} items={(info.fertilizers || []).map(item => t(item))} />
                <ListSection label={t("Pesticides / crop protection")} items={(info.pesticides || []).map(item => t(item))} />
              </SectionCard>

              {info.notes && (
                <SectionCard title={t("Additional guidance")}>
                  <div className="text-sm text-gray-700 leading-relaxed">{t(info.notes)}</div>
                </SectionCard>
              )}
            </div>

            <aside className="space-y-6">
              <div className="rounded-3xl border border-green-200 bg-white p-6 shadow-sm">
                <p className="text-xs uppercase tracking-widest text-green-700">{t("Crop at a glance")}</p>
                <div className="mt-4 space-y-2 text-sm text-gray-700">
                  <div className="flex items-center justify-between rounded-2xl bg-green-50 px-4 py-3">
                    <span>{t("Recommended season")}</span>
                    <span className="font-semibold">{t(info.season)}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl bg-green-50 px-4 py-3">
                    <span>{t("Soil pH")}</span>
                    <span className="font-semibold">{t(info.ph)}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl bg-green-50 px-4 py-3">
                    <span>{t("Water use")}</span>
                    <span className="font-semibold">{t(info.water)}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl bg-green-50 px-4 py-3">
                    <span>{t("Growing days")}</span>
                    <span className="font-semibold">{info.days}</span>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-green-200 bg-green-50 p-6 shadow-sm">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">{t("Crop guide")}</h3>
                <p className="mt-3 text-sm text-gray-600 leading-relaxed">{t("These details help you plan each stage from sowing through harvest, select the right seed, and protect the crop from pests.")}</p>
              </div>
            </aside>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
