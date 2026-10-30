#!/usr/bin/env python3
"""Work log: store entries as JSONL and export to text, HTML or iCalendar."""
import argparse, datetime as dt, html, json, os, sys, uuid
from pathlib import Path

ROOT = Path(os.environ.get("WORKLOG_DIR", Path.cwd() / "worklog"))


def load(start=None, end=None):
    items = []
    for f in sorted(ROOT.glob("*.jsonl")):
        for line in f.read_text(encoding="utf-8").splitlines():
            if line.strip():
                e = json.loads(line)
                if (not start or e["date"] >= start) and (not end or e["date"] <= end):
                    items.append(e)
    return sorted(items, key=lambda e: (e["date"], e.get("start") or ""))


def save_month(month, items):
    path = ROOT / f"{month}.jsonl"
    if items:
        path.write_text("".join(json.dumps(e, ensure_ascii=False) + "\n" for e in items), encoding="utf-8")
    elif path.exists():
        path.unlink()


def cmd_add(a):
    dt.date.fromisoformat(a.date)
    for t in (a.start, a.end):
        if t:
            dt.time.fromisoformat(t)
    e = {"id": uuid.uuid4().hex[:8], "date": a.date, "title": a.title}
    if a.start: e["start"] = a.start
    if a.end: e["end"] = a.end
    if a.category: e["category"] = a.category
    if a.tags: e["tags"] = [t.strip() for t in a.tags.split(",") if t.strip()]
    if a.notes: e["notes"] = a.notes
    ROOT.mkdir(parents=True, exist_ok=True)
    with open(ROOT / f"{a.date[:7]}.jsonl", "a", encoding="utf-8") as f:
        f.write(json.dumps(e, ensure_ascii=False) + "\n")
    print(f"added {e['id']}: {e['date']} {e['title']}")


def cmd_delete(a):
    for f in ROOT.glob("*.jsonl"):
        items = [json.loads(l) for l in f.read_text(encoding="utf-8").splitlines() if l.strip()]
        kept = [e for e in items if e["id"] != a.id]
        if len(kept) != len(items):
            save_month(f.stem, kept)
            print(f"deleted {a.id}")
            return
    sys.exit(f"no entry with id {a.id}")


def time_range(e):
    return f"{e.get('start', '')}-{e.get('end', '')}" if e.get("start") else "종일"


def cmd_list(a):
    items = load(a.start, a.end)
    if a.json:
        print(json.dumps(items, ensure_ascii=False, indent=2))
        return
    day = None
    for e in items:
        if e["date"] != day:
            day = e["date"]
            print(f"\n## {day}")
        extra = f" [{e['category']}]" if e.get("category") else ""
        tags = " " + " ".join("#" + t for t in e.get("tags", [])) if e.get("tags") else ""
        print(f"- ({e['id']}) {time_range(e)} {e['title']}{extra}{tags}")
        if e.get("notes"):
            print(f"    {e['notes']}")


def minutes(e):
    if not (e.get("start") and e.get("end")):
        return 0
    s, t = (dt.datetime.combine(dt.date.min, dt.time.fromisoformat(x)) for x in (e["start"], e["end"]))
    return max(0, int((t - s).total_seconds() // 60))


def cmd_html(a):
    items = load(a.start, a.end)
    esc = html.escape
    by_cat = {}
    for e in items:
        by_cat[e.get("category", "기타")] = by_cat.get(e.get("category", "기타"), 0) + minutes(e)
    days, rows = {}, []
    for e in items:
        days.setdefault(e["date"], []).append(e)
    for d, es in days.items():
        wd = "월화수목금토일"[dt.date.fromisoformat(d).weekday()]
        rows.append(f'<section><h2>{d} <small>({wd})</small></h2><ul>')
        for e in es:
            tags = "".join(f'<span class="tag">#{esc(t)}</span>' for t in e.get("tags", []))
            cat = f'<span class="cat">{esc(e["category"])}</span>' if e.get("category") else ""
            notes = f'<p>{esc(e["notes"])}</p>' if e.get("notes") else ""
            rows.append(f'<li><span class="time">{time_range(e)}</span><div><b>{esc(e["title"])}</b> {cat}{tags}{notes}</div></li>')
        rows.append("</ul></section>")
    stats = "".join(f"<li>{esc(c)} <b>{m // 60}h {m % 60}m</b></li>" for c, m in sorted(by_cat.items(), key=lambda x: -x[1]))
    period = f"{a.start or (items[0]['date'] if items else '')} ~ {a.end or (items[-1]['date'] if items else '')}"
    doc = f"""<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>업무 일지</title><style>
:root{{--bg:#fafaf9;--fg:#1c1917;--muted:#78716c;--card:#fff;--line:#e7e5e4;--accent:#2563eb}}
@media (prefers-color-scheme:dark){{:root{{--bg:#1c1917;--fg:#f5f5f4;--muted:#a8a29e;--card:#292524;--line:#44403c;--accent:#60a5fa}}}}
body{{margin:0;background:var(--bg);color:var(--fg);font:15px/1.6 system-ui,sans-serif}}
main{{max-width:760px;margin:0 auto;padding:32px 16px}}h1{{margin:0}}.muted{{color:var(--muted)}}
section{{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:12px 20px;margin:16px 0}}
h2{{font-size:17px;margin:4px 0}}ul{{list-style:none;padding:0;margin:0}}
li{{display:flex;gap:16px;padding:8px 0;border-top:1px solid var(--line)}}li:first-child{{border:0}}
.time{{min-width:96px;color:var(--muted);font-variant-numeric:tabular-nums}}li p{{margin:4px 0 0;color:var(--muted)}}
.cat{{font-size:12px;background:var(--accent);color:#fff;border-radius:6px;padding:1px 6px}}.tag{{font-size:12px;color:var(--accent);margin-left:6px}}
.stats{{display:flex;flex-wrap:wrap;gap:8px 20px}}.stats li{{border:0;padding:0}}
</style></head><body><main><h1>업무 일지</h1><p class="muted">{esc(period)} · {len(items)}건</p>
<ul class="stats">{stats}</ul>{''.join(rows) or '<p>기록 없음</p>'}</main></body></html>"""
    write(a.output, doc)


def ics_text(s):
    return s.replace("\\", "\\\\").replace(";", "\;").replace(",", "\\,").replace("\n", "\\n")


def cmd_ics(a):
    now = dt.datetime.now(dt.timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    out = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//work-log//KO", "CALSCALE:GREGORIAN", "X-WR-CALNAME:업무 일지"]
    for e in load(a.start, a.end):
        d = e["date"].replace("-", "")
        out += ["BEGIN:VEVENT", f"UID:{e['id']}@work-log", f"DTSTAMP:{now}"]
        if e.get("start"):
            end = e.get("end") or e["start"]
            out += [f"DTSTART:{d}T{e['start'].replace(':', '')}00", f"DTEND:{d}T{end.replace(':', '')}00"]
        else:
            nxt = (dt.date.fromisoformat(e["date"]) + dt.timedelta(days=1)).strftime("%Y%m%d")
            out += [f"DTSTART;VALUE=DATE:{d}", f"DTEND;VALUE=DATE:{nxt}"]
        out.append(f"SUMMARY:{ics_text(e['title'])}")
        if e.get("notes"): out.append(f"DESCRIPTION:{ics_text(e['notes'])}")
        cats = ([e["category"]] if e.get("category") else []) + e.get("tags", [])
        if cats: out.append("CATEGORIES:" + ",".join(ics_text(c) for c in cats))
        out.append("END:VEVENT")
    out.append("END:VCALENDAR")
    write(a.output, "\r\n".join(out) + "\r\n")


def write(path, text):
    if path:
        Path(path).parent.mkdir(parents=True, exist_ok=True)
        Path(path).write_text(text, encoding="utf-8")
        print(f"wrote {path}")
    else:
        sys.stdout.write(text)


def main():
    p = argparse.ArgumentParser(description=__doc__)
    sub = p.add_subparsers(dest="cmd", required=True)
    s = sub.add_parser("add")
    s.add_argument("--title", required=True)
    s.add_argument("--date", default=dt.date.today().isoformat())
    for k in ("start", "end", "category", "tags", "notes"):
        s.add_argument(f"--{k}")
    s.set_defaults(fn=cmd_add)
    s = sub.add_parser("delete"); s.add_argument("--id", required=True); s.set_defaults(fn=cmd_delete)
    for name, fn in (("list", cmd_list), ("html", cmd_html), ("ics", cmd_ics)):
        s = sub.add_parser(name)
        s.add_argument("--from", dest="start"); s.add_argument("--to", dest="end")
        if name == "list": s.add_argument("--json", action="store_true")
        else: s.add_argument("-o", "--output")
        s.set_defaults(fn=fn)
    a = p.parse_args()
    a.fn(a)


if __name__ == "__main__":
    main()
