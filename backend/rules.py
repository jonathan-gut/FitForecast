# backend/rules.py

from typing import List, Dict, Optional
from collections import defaultdict
from backend.models import Item

# Map occasions to desired formality + activity_comfort
OCCASION_PROFILES: Dict[str, Dict[str, str]] = {
    "casual_outing": {"formality": "casual", "activity": "outdoor"},
    "work_office":   {"formality": "business", "activity": "indoor"},
    "formal_event":  {"formality": "formal", "activity": "indoor"},
    "workout":       {"formality": "workout", "activity": "workout"},
}

def temp_to_warmth_band(temp_f: float) -> int:
    """
    Convert temperature into a target warmth_score (very rough).
    90+   -> 2
    75-89 -> 3
    60-74 -> 5
    45-59 -> 7
    <45   -> 9
    """
    if temp_f >= 90:
        return 2
    if temp_f >= 75:
        return 3
    if temp_f >= 60:
        return 5
    if temp_f >= 45:
        return 7
    return 9

def score_item(
    item: Item,
    temp_f: float,
    occasion: str,
    condition: Optional[str] = None,
) -> float:
    """
    Higher score = better match.
    Combine:
      - warmth distance
      - formality match
      - activity_comfort match
      - (optionally) weather condition
    """
    if item.warmth_score is None:
        return -999

    target_warmth = temp_to_warmth_band(temp_f)
    warmth_penalty = abs(item.warmth_score - target_warmth)

    profile = OCCASION_PROFILES.get(occasion, {})
    desired_formality = profile.get("formality")
    desired_activity = profile.get("activity")

    formality_bonus = 0.0
    if desired_formality and item.formality:
        if item.formality == desired_formality:
            formality_bonus = 3.0
        elif item.formality in ("casual", "business") and desired_formality in ("casual", "business"):
            formality_bonus = 1.0

    activity_bonus = 0.0
    if desired_activity and item.activity_comfort:
        if item.activity_comfort == desired_activity:
            activity_bonus = 2.0

    # Base score
    score = 10.0
    score -= warmth_penalty * 1.2
    score += formality_bonus
    score += activity_bonus

    # ---- Weather condition adjustment (simple) ----
    if condition:
        condition = condition.lower()
        # Very hot & sunny -> penalize warm items
        if condition == "sunny" and temp_f >= 85:
            if item.warmth_score >= 6:
                score -= 3.0
        # Rainy -> small bonus for boots, outerwear
        if condition == "rainy":
            if item.category == "outerwear":
                score += 1.5
            if item.category == "shoes" and "boot" in (item.name or "").lower():
                score += 2.0
        # Snowy -> big bonus for warm stuff
        if condition == "snowy":
            if item.warmth_score >= 7:
                score += 2.5
            else:
                score -= 2.0

    return score

def pick_outfit(
    items: List[Item],
    temp_f: float,
    occasion: str,
    condition: Optional[str] = None,
    limit: int = 4,
) -> List[Item]:
    """
    Score items and build a more realistic outfit:
      - Try to pick: 1 top, 1 bottom, 1 shoes
      - Only add outerwear if it's cool/cold
      - Fall back to best available if some category is missing
    """
    scored = []
    for item in items:
        s = score_item(item, temp_f, occasion, condition)
        if s > 0:
            scored.append((item, s))

    if not scored:
        return []

    # Group by category
    by_cat = defaultdict(list)
    for item, s in scored:
        cat = (item.category or "").lower()
        by_cat[cat].append((item, s))

    # sort each category by score desc
    for cat in by_cat:
        by_cat[cat].sort(key=lambda x: x[1], reverse=True)

    outfit: List[Item] = []

    def best_from(cat_name: str):
        lst = by_cat.get(cat_name, [])
        return lst[0][0] if lst else None

    # 1) Always try to get a top, bottom, shoes
    top = best_from("top")
    bottom = best_from("bottom")
    shoes = best_from("shoes")

    if top:
        outfit.append(top)
    if bottom:
        outfit.append(bottom)
    if shoes:
        outfit.append(shoes)

    # 2) Add outerwear only if it's not very hot
    outerwear_needed = temp_f < 65
    if outerwear_needed:
        ow = best_from("outerwear")
        if ow:
            outfit.append(ow)

    # 3) Fill any remaining slots with best remaining items
    if len(outfit) < limit:
        used_ids = {i.id for i in outfit}
        scored.sort(key=lambda x: x[1], reverse=True)
        for item, s in scored:
            if item.id in used_ids:
                continue
            outfit.append(item)
            used_ids.add(item.id)
            if len(outfit) >= limit:
                break

    return outfit[:limit]