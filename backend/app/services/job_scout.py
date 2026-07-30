import httpx
import json
import re
from bs4 import BeautifulSoup
from urllib.parse import quote, urlencode
from datetime import datetime


USER_AGENT = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
    "AppleWebKit/537.36 (KHTML, like Gecko) "
    "Chrome/125.0.0.0 Safari/537.36"
)

HEADERS = {
    "User-Agent": USER_AGENT,
    "Accept": "text/html,application/json,*/*",
    "Accept-Language": "en-US,en;q=0.5",
}


async def search_indeed(query: str, location: str = "", min_salary: int = 0, max_results: int = 25) -> list[dict]:
    jobs = []
    try:
        params = {"q": query, "l": location, "limit": min(max_results, 50)}
        if min_salary:
            params["salary"] = f"{min_salary}"
        
        url = f"https://www.indeed.com/jobs?{urlencode(params)}"
        async with httpx.AsyncClient(follow_redirects=True, timeout=15) as client:
            resp = await client.get(url, headers=HEADERS)
            if resp.status_code != 200:
                return jobs
            
            soup = BeautifulSoup(resp.text, "lxml")
            for card in soup.select(".job_seen_beacon, .jobCard, .result")[:max_results]:
                try:
                    title_el = card.select_one(".jobTitle, .title, h2 a")
                    company_el = card.select_one(".companyName, .company, .cmp-name")
                    loc_el = card.select_one(".companyLocation, .location")
                    salary_el = card.select_one(".salary-snippet, .salary, .estimated-salary")
                    desc_el = card.select_one(".job-snippet, .summary")
                    link_el = card.select_one("a[href*='rc/clk'], .jobTitle a")
                    
                    title = title_el.get_text(strip=True) if title_el else "Unknown"
                    company = company_el.get_text(strip=True) if company_el else "Unknown"
                    location = loc_el.get_text(strip=True) if loc_el else ""
                    salary_text = salary_el.get_text(strip=True) if salary_el else ""
                    description = desc_el.get_text(strip=True) if desc_el else ""
                    relative_link = link_el.get("href", "") if link_el else ""
                    
                    full_url = f"https://www.indeed.com{relative_link}" if relative_link.startswith("/") else relative_link
                    salary_min, salary_max = _parse_salary(salary_text)
                    
                    jobs.append({
                        "title": title, "company": company, "location": location,
                        "description": description[:500], "url": full_url,
                        "source": "indeed", "salary_min": salary_min, "salary_max": salary_max,
                    })
                except Exception:
                    continue
    except Exception:
        pass
    return jobs


async def search_google_jobs(query: str, location: str = "", max_results: int = 25) -> list[dict]:
    jobs = []
    try:
        search_query = f"{query} jobs in {location}" if location else f"{query} jobs"
        params = {"q": search_query, "hl": "en", "num": min(max_results, 50)}
        url = f"https://www.google.com/search?{urlencode(params)}"
        
        async with httpx.AsyncClient(follow_redirects=True, timeout=15) as client:
            resp = await client.get(url, headers=HEADERS)
            if resp.status_code != 200:
                return jobs
            
            soup = BeautifulSoup(resp.text, "lxml")
            for result in soup.select("[jsname], .g, .job-container")[:max_results]:
                try:
                    text = result.get_text(" ", strip=True)
                    if any(kw in text.lower() for kw in ["job", "hiring", "apply", "salary"]):
                        title_el = result.select_one("h3, .jobTitle, [role='heading']")
                        if title_el:
                            jobs.append({
                                "title": title_el.get_text(strip=True),
                                "company": _extract_company(text),
                                "location": location,
                                "description": text[:500],
                                "url": "",
                                "source": "google",
                                "salary_min": 0, "salary_max": 0,
                            })
                except Exception:
                    continue
    except Exception:
        pass
    return jobs


def _parse_salary(text: str) -> tuple[float, float]:
    if not text:
        return 0, 0
    numbers = [float(n) for n in re.findall(r'\d+[\d,]*', text.replace(",", ""))]
    if len(numbers) >= 2:
        return numbers[0], numbers[1]
    elif numbers:
        return numbers[0], numbers[0] * 1.2
    return 0, 0


def _extract_company(text: str) -> str:
    patterns = [
        r'(?:at|by|with)\s+([A-Z][A-Za-z0-9\s&.]+?)(?:\s*[-–—]|\s*$|\s*\()',
        r'^([A-Z][A-Za-z0-9\s&.]+?)\s*(?:is hiring|jobs|careers)',
    ]
    for p in patterns:
        m = re.search(p, text, re.IGNORECASE)
        if m:
            return m.group(1).strip()[:50]
    return "Unknown"


async def search_linkedin_jobs(query: str, location: str = "", max_results: int = 25) -> list[dict]:
    jobs = []
    try:
        encoded_query = quote(f"{query} {location}" if location else query)
        url = f"https://www.linkedin.com/jobs/search/?keywords={encoded_query}"
        async with httpx.AsyncClient(follow_redirects=True, timeout=15) as client:
            resp = await client.get(url, headers={**HEADERS, "Accept": "text/html"})
            if resp.status_code != 200:
                return jobs
            
            soup = BeautifulSoup(resp.text, "lxml")
            seen = set()
            for card in soup.select(".job-card-container, .base-card, .job-search-card")[:max_results]:
                try:
                    title_el = card.select_one(".job-card-list__title, .base-search-card__title, a[data-tracking-control-name]")
                    company_el = card.select_one(".job-card-container__company-name, .base-search-card__subtitle")
                    loc_el = card.select_one(".job-card-container__metadata-wrapper, .job-search-card__location")
                    link_el = card.select_one("a[href*='linkedin.com/jobs']")
                    
                    title = title_el.get_text(strip=True) if title_el else "Unknown"
                    if title in seen:
                        continue
                    seen.add(title)
                    
                    jobs.append({
                        "title": title,
                        "company": company_el.get_text(strip=True) if company_el else "Unknown",
                        "location": loc_el.get_text(strip=True) if loc_el else location,
                        "description": "", "url": link_el.get("href", "") if link_el else "",
                        "source": "linkedin", "salary_min": 0, "salary_max": 0,
                    })
                except Exception:
                    continue
    except Exception:
        pass
    return jobs


async def search_all_sources(query: str, location: str = "", min_salary: int = 0, max_results: int = 50) -> list[dict]:
    from asyncio import gather
    
    per_source = max(max_results // 3, 10)
    results = await gather(
        search_indeed(query, location, min_salary, per_source),
        search_google_jobs(query, location, per_source),
        search_linkedin_jobs(query, location, per_source),
        return_exceptions=True
    )
    
    all_jobs = []
    for r in results:
        if isinstance(r, list):
            all_jobs.extend(r)
    
    seen = set()
    deduped = []
    for job in all_jobs:
        key = (job["title"].lower(), job["company"].lower())
        if key not in seen:
            seen.add(key)
            if min_salary > 0:
                if job["salary_min"] >= min_salary or job["salary_max"] >= min_salary:
                    deduped.append(job)
            else:
                deduped.append(job)
    
    return deduped[:max_results]
