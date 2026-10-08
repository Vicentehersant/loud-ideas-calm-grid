/* eslint-disable @next/next/no-img-element */
// Render target for the social share image (1200×630). Screenshot → app/opengraph-image.png
export const metadata = { robots: { index: false } };
const IMGS = ["people-09-people-friends-06", "people-13-people-picnic-12", "people-11-people-friends-21", "people-12-people-making-31", "art-sketch-03", "people-01-people-dinner-08"];
export default function Og() {
  return (
    <main style={{ width: 1200, height: 630, overflow: "hidden" }} className="relative flex bg-[var(--neutral-100)]">
      <div className="flex w-[560px] flex-col justify-center gap-6 pl-16">
        <svg width="72" height="72" viewBox="0 0 64 64" aria-hidden><circle cx="35" cy="35" r="25" fill="#860013" /><circle cx="29" cy="29" r="25" fill="#E60023" stroke="#860013" strokeWidth="4" /></svg>
        <p className="text-[76px] font-semibold leading-[0.95] tracking-tight text-[var(--neutral-900)]">Loud ideas,<br /><span className="text-[var(--red-700)]">calm grid.</span></p>
        <p className="text-[24px] text-[var(--neutral-600)]">A new brand &amp; design system for Pinterest</p>
        <p className="text-[18px] font-semibold text-[var(--neutral-600)]">Vicente Hernaiz · UXDG 315</p>
      </div>
      <div className="relative flex flex-1 gap-3 pr-10" style={{ maskImage: "linear-gradient(to bottom, transparent, #000 12%, #000 88%, transparent)" }}>
        {[0, 1, 2].map((c) => (
          <div key={c} className="flex flex-1 flex-col gap-3" style={{ marginTop: [-40, -120, -70][c] }}>
            {[0, 1].map((r) => (
              <img key={r} src={`/mood/${IMGS[c * 2 + r]}.jpg`} alt="" className="w-full rounded-[10px] object-cover" style={{ height: [300, 380, 330][(c + r) % 3] }} />
            ))}
          </div>
        ))}
        <span className="absolute left-[34%] top-[46%] grid h-20 w-20 place-items-center rounded-full border-2 border-[#860013] bg-[#E60023] text-white" style={{ boxShadow: "5px 5px 0 #860013" }}>
          <svg width="34" height="34" viewBox="0 0 256 256" fill="#fff"><path d="M235.33,104l-53.47,53.65c4.56,12.67,6.45,33.89-13.19,60A15.93,15.93,0,0,1,157,224c-.38,0-.75,0-1.13,0a16,16,0,0,1-11.32-4.69L96.29,171,53.66,213.66a8,8,0,0,1-11.32-11.32L85,159.71l-48.3-48.3A16,16,0,0,1,38,87.63c25.42-20.51,49.75-16.48,60.4-13.14L152,20.7a16,16,0,0,1,22.63,0l60.69,60.68A16,16,0,0,1,235.33,104Z" /></svg>
        </span>
      </div>
    </main>
  );
}
