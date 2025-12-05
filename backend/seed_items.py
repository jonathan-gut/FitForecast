from backend.db import SessionLocal
from backend.models import Item

def main():
    db = SessionLocal()

    # Safety check
    count = db.query(Item).count()
    if count > 0:
        print(f"{count} items already exist — aborting.")
        return

    items = []

    # === BASE ITEMS ===
    tops = [
        ("Tank Top", "casual", 1, "outdoor"),
        ("T-Shirt", "casual", 2, "outdoor"),
        ("Polo Shirt", "casual", 3, "indoor"),
        ("Long Sleeve Shirt", "casual", 4, "indoor"),
        ("Dress Shirt", "business", 4, "indoor"),
        ("Blouse", "business", 4, "indoor"),
        ("Thermal Shirt", "casual", 7, "outdoor"),
        ("Sweater", "casual", 7, "indoor"),
        ("Hoodie", "casual", 6, "outdoor"),
        ("Workout Tee", "workout", 1, "workout"),
    ]

    bottoms = [
        ("Shorts", "casual", 1, "outdoor"),
        ("Running Shorts", "workout", 1, "workout"),
        ("Jeans", "casual", 4, "outdoor"),
        ("Chinos", "casual", 3, "indoor"),
        ("Dress Pants", "business", 4, "indoor"),
        ("Sweatpants", "casual", 5, "indoor"),
        ("Leggings", "workout", 2, "workout"),
        ("Cargo Pants", "casual", 5, "outdoor"),
        ("Skirt", "casual", 2, "indoor"),
        ("Slacks", "business", 4, "indoor"),
    ]

    outerwear = [
        ("Light Jacket", "casual", 5, "outdoor"),
        ("Windbreaker", "casual", 4, "outdoor"),
        ("Denim Jacket", "casual", 5, "outdoor"),
        ("Leather Jacket", "casual", 7, "outdoor"),
        ("Blazer", "business", 6, "indoor"),
        ("Cardigan", "casual", 4, "indoor"),
        ("Puffer Jacket", "casual", 9, "outdoor"),
        ("Peacoat", "formal", 8, "indoor"),
        ("Overcoat", "formal", 8, "indoor"),
        ("Fleece Jacket", "casual", 6, "outdoor"),
    ]

    shoes = [
        ("Sneakers", "casual", 2, "outdoor"),
        ("Running Shoes", "workout", 2, "workout"),
        ("Boots", "casual", 5, "outdoor"),
        ("Dress Shoes", "business", 3, "indoor"),
        ("Loafers", "business", 3, "indoor"),
        ("Heels", "formal", 2, "indoor"),
        ("Sandals", "casual", 1, "outdoor"),
        ("Hiking Boots", "casual", 6, "outdoor"),
        ("Flats", "casual", 2, "indoor"),
        ("Slip-ons", "casual", 1, "indoor"),
    ]

    def expand_to_25(base_list, category_name):
        expanded = []
        i = 0
        while len(expanded) < 25:
            name, formality, warmth, activity = base_list[i % len(base_list)]
            variant_num = len(expanded) // len(base_list)
            item_name = f"{name} (v{variant_num})" if variant_num > 0 else name

            expanded.append(
                Item(
                    name=item_name,
                    category=category_name,
                    formality=formality,
                    warmth_score=warmth,
                    activity_comfort=activity,
                )
            )
            i += 1
        return expanded

    items.extend(expand_to_25(tops, "top"))
    items.extend(expand_to_25(bottoms, "bottom"))
    items.extend(expand_to_25(outerwear, "outerwear"))
    items.extend(expand_to_25(shoes, "shoes"))

    print(f"Prepared {len(items)} items for insertion...")

    db.add_all(items)
    db.commit()
    db.close()
    print("Seeded exactly 100 high-quality items.")

if __name__ == "__main__":
    main()