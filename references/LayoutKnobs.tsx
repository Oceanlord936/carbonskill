"use client";
// REFERENCE COPY from SiteWatch (src/app/(carbon)/status/SizeTester.tsx , 2026-11-23): adapt the knobs and CSS variables to the page.
// CSS for the box: layout-knobs.css next to this file.

import { Button } from "@carbon/react";
import { Add, Subtract } from "@carbon/react/icons";
import { useEffect, useState } from "react";

// TEST ONLY: live knobs to find the right ratios by eye , then the numbers get written into status.css
// HIDDEN by default: Views.tsx shows it only when SHOW_LAYOUT_KNOBS = true (and never in production)
// starts at the values in status.css (picked 2026-11-23) ; a reload goes back to them ; 1% per click
//   page size      the base size (html:root 90% in status.css)
//   nav (closed)   the icon rail's width as a % of the window (--status-nav-rail) ;
//                  the page edge , the ☰ square and the top bar's height follow it
//   nav (open)     the open side nav's width as a % of the window (--status-nav-open)
//   icon size      the nav icons as a % of Carbon's 1rem icon (--status-nav-icon) , 10% steps (1% would be ~0.14px)
//   nav item gap   nav open: the white gap right of an item's grey , as a % of the window (--status-nav-item-gap)
//   hints          the hints column's share of the row main + hints (.status-with-hints , --status-with-hints-columns)
export function LayoutKnobs() {
  const [page, setPage] = useState(90);
  const [rail, setRail] = useState(4);
  const [nav, setNav] = useState(16);
  const [gap, setGap] = useState(1);
  const [icon, setIcon] = useState(150);
  const [hints, setHints] = useState(28);

  useEffect(() => {
    document.documentElement.style.fontSize = `${page}%`;
  }, [page]);

  useEffect(() => {
    document.documentElement.style.setProperty("--status-nav-rail", `${rail}vw`);
  }, [rail]);

  useEffect(() => {
    document.documentElement.style.setProperty("--status-nav-open", `${nav}vw`);
  }, [nav]);

  useEffect(() => {
    document.documentElement.style.setProperty("--status-nav-item-gap", `${gap}vw`);
  }, [gap]);

  useEffect(() => {
    document.documentElement.style.setProperty("--status-nav-icon", `calc(1rem * ${icon / 100})`);
  }, [icon]);

  useEffect(() => {
    const main = 100 - hints;
    document.documentElement.style.setProperty(
      "--status-with-hints-columns",
      `minmax(0, ${main}fr) minmax(0, ${hints}fr)`,
    );
  }, [hints]);

  return (
    <div className="status-size-tester" role="group" aria-label="Layout knobs (test)">
      <Knob label="Page size" value={`${page} %`} onLess={() => setPage(page - 1)} onMore={() => setPage(page + 1)} />
      <Knob label="Nav (closed)" value={`${rail} % of window`} onLess={() => setRail(rail - 1)} onMore={() => setRail(rail + 1)} />
      <Knob label="Nav (open)" value={`${nav} % of window`} onLess={() => setNav(nav - 1)} onMore={() => setNav(nav + 1)} />
      <Knob label="Icon size" value={`${icon} %`} onLess={() => setIcon(icon - 10)} onMore={() => setIcon(icon + 10)} />
      <Knob label="Nav item gap" value={`${gap} % of window`} onLess={() => setGap(gap - 1)} onMore={() => setGap(gap + 1)} />
      <Knob
        label="Hints"
        value={`main ${100 - hints} : hints ${hints}`}
        onLess={() => setHints(hints - 1)}
        onMore={() => setHints(hints + 1)}
      />
      <span className="status-size-tester-note">test only</span>
    </div>
  );
}

function Knob({
  label,
  value,
  onLess,
  onMore,
}: {
  label: string;
  value: string;
  onLess: () => void;
  onMore: () => void;
}) {
  return (
    <span className="status-size-tester-knob">
      <span>{label}</span>
      <Button kind="ghost" size="sm" hasIconOnly renderIcon={Subtract} iconDescription={`${label} smaller`} onClick={onLess} />
      <strong className="status-size-tester-value">{value}</strong>
      <Button kind="ghost" size="sm" hasIconOnly renderIcon={Add} iconDescription={`${label} bigger`} onClick={onMore} />
    </span>
  );
}
