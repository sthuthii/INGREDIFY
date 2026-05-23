"""
Ingredient harm database.
Rule-based knowledge base of harmful ingredients, their risk categories,
severity levels, and explanations.
"""

# ── Harmful ingredients database ─────────────────────────────────────────────
# Each entry: ingredient name (lowercase) → metadata
HARMFUL_INGREDIENTS = {
    # ── Preservatives ─────────────────────────────────────────────────────────
    "sodium benzoate": {
        "risk": "Preservative",
        "severity": "Medium",
        "category": "Preservative",
        "explanation": "May cause hyperactivity in children and allergic reactions. When combined with Vitamin C, forms benzene (a carcinogen).",
        "conditions": ["hypertension"],
    },
    "potassium benzoate": {
        "risk": "Preservative",
        "severity": "Medium",
        "category": "Preservative",
        "explanation": "Similar to sodium benzoate. May form benzene when combined with ascorbic acid.",
        "conditions": [],
    },
    "bha": {
        "risk": "Preservative",
        "severity": "High",
        "category": "Preservative",
        "explanation": "Butylated Hydroxyanisole — possible carcinogen. Listed as reasonably anticipated to be a human carcinogen.",
        "conditions": [],
    },
    "bht": {
        "risk": "Preservative",
        "severity": "Medium",
        "category": "Preservative",
        "explanation": "Butylated Hydroxytoluene — may cause liver damage at high doses. Possible endocrine disruptor.",
        "conditions": ["pcos"],
    },
    "sodium nitrate": {
        "risk": "Preservative",
        "severity": "High",
        "category": "Preservative",
        "explanation": "Can convert to nitrosamines (carcinogens) in the body. Linked to increased cancer risk with high consumption.",
        "conditions": ["hypertension", "heart_disease"],
    },
    "sodium nitrite": {
        "risk": "Preservative",
        "severity": "High",
        "category": "Preservative",
        "explanation": "Forms carcinogenic nitrosamines. Linked to colorectal cancer risk with processed meat consumption.",
        "conditions": ["hypertension", "heart_disease"],
    },
    "tbhq": {
        "risk": "Preservative",
        "severity": "Medium",
        "category": "Preservative",
        "explanation": "Tertiary butylhydroquinone — may affect immune system function. Linked to food intolerances.",
        "conditions": [],
    },
    "sulfites": {
        "risk": "Preservative",
        "severity": "Medium",
        "category": "Preservative",
        "explanation": "Can trigger asthma and allergic reactions in sensitive individuals.",
        "conditions": [],
    },
    "sodium sulfite": {
        "risk": "Preservative",
        "severity": "Medium",
        "category": "Preservative",
        "explanation": "Can cause asthma-like symptoms and allergic reactions.",
        "conditions": [],
    },

    # ── Artificial sweeteners ─────────────────────────────────────────────────
    "aspartame": {
        "risk": "Artificial Sweetener",
        "severity": "Medium",
        "category": "Artificial Sweetener",
        "explanation": "May cause headaches and dizziness in sensitive individuals. Classified as possibly carcinogenic (Group 2B) by IARC.",
        "conditions": [],
    },
    "saccharin": {
        "risk": "Artificial Sweetener",
        "severity": "Low",
        "category": "Artificial Sweetener",
        "explanation": "Older sweetener with controversial safety history. May affect gut microbiome.",
        "conditions": [],
    },
    "sucralose": {
        "risk": "Artificial Sweetener",
        "severity": "Low",
        "category": "Artificial Sweetener",
        "explanation": "May alter gut bacteria and insulin response. Generally considered safe in moderate amounts.",
        "conditions": ["diabetes"],
    },
    "acesulfame potassium": {
        "risk": "Artificial Sweetener",
        "severity": "Low",
        "category": "Artificial Sweetener",
        "explanation": "Also known as Ace-K. Some studies suggest effects on gut microbiome and metabolic function.",
        "conditions": ["diabetes"],
    },
    "acesulfame-k": {
        "risk": "Artificial Sweetener",
        "severity": "Low",
        "category": "Artificial Sweetener",
        "explanation": "May affect gut microbiome and metabolic function.",
        "conditions": ["diabetes"],
    },

    # ── Artificial colors ─────────────────────────────────────────────────────
    "red 40": {
        "risk": "Artificial Color",
        "severity": "Medium",
        "category": "Artificial Color",
        "explanation": "Allura Red — linked to hyperactivity in children. Contains benzidine, a carcinogen.",
        "conditions": [],
    },
    "yellow 5": {
        "risk": "Artificial Color",
        "severity": "Medium",
        "category": "Artificial Color",
        "explanation": "Tartrazine — can cause allergic reactions and hyperactivity. Banned in some countries.",
        "conditions": [],
    },
    "yellow 6": {
        "risk": "Artificial Color",
        "severity": "Medium",
        "category": "Artificial Color",
        "explanation": "Sunset Yellow — may cause allergic reactions and hyperactivity in children.",
        "conditions": [],
    },
    "blue 1": {
        "risk": "Artificial Color",
        "severity": "Low",
        "category": "Artificial Color",
        "explanation": "Brilliant Blue — generally considered safe but may cause allergic reactions in rare cases.",
        "conditions": [],
    },
    "blue 2": {
        "risk": "Artificial Color",
        "severity": "Medium",
        "category": "Artificial Color",
        "explanation": "Indigo Carmine — some studies suggest possible brain tumor risk at high doses.",
        "conditions": [],
    },
    "red 3": {
        "risk": "Artificial Color",
        "severity": "High",
        "category": "Artificial Color",
        "explanation": "Erythrosine — known thyroid disruptor. Banned in cosmetics but still allowed in food.",
        "conditions": ["pcos"],
    },
    "caramel color": {
        "risk": "Artificial Color",
        "severity": "Medium",
        "category": "Artificial Color",
        "explanation": "Class IV caramel color contains 4-MEI, a possible carcinogen.",
        "conditions": [],
    },

    # ── Fats & oils ───────────────────────────────────────────────────────────
    "partially hydrogenated": {
        "risk": "Trans Fat",
        "severity": "Critical",
        "category": "Trans Fat",
        "explanation": "Contains trans fats which raise LDL cholesterol and lower HDL. Major risk factor for heart disease. Banned in many countries.",
        "conditions": ["heart_disease", "hypertension", "diabetes"],
    },
    "trans fat": {
        "risk": "Trans Fat",
        "severity": "Critical",
        "category": "Trans Fat",
        "explanation": "Strongly linked to cardiovascular disease, inflammation, and insulin resistance.",
        "conditions": ["heart_disease", "hypertension", "diabetes"],
    },
    "hydrogenated vegetable oil": {
        "risk": "Trans Fat",
        "severity": "High",
        "category": "Trans Fat",
        "explanation": "Contains or may contain trans fats. Raises bad cholesterol and increases heart disease risk.",
        "conditions": ["heart_disease", "hypertension"],
    },
    "palm oil": {
        "risk": "Saturated Fat",
        "severity": "Low",
        "category": "Saturated Fat",
        "explanation": "High in saturated fat. Regular consumption may contribute to cardiovascular risk. Also has environmental concerns.",
        "conditions": ["heart_disease"],
    },

    # ── Flavor enhancers ──────────────────────────────────────────────────────
    "monosodium glutamate": {
        "risk": "Flavor Enhancer",
        "severity": "Low",
        "category": "Flavor Enhancer",
        "explanation": "MSG — generally recognized as safe. Some individuals report sensitivity (headaches, flushing). Adds significant sodium.",
        "conditions": ["hypertension"],
    },
    "msg": {
        "risk": "Flavor Enhancer",
        "severity": "Low",
        "category": "Flavor Enhancer",
        "explanation": "Monosodium glutamate — generally safe but some individuals report sensitivity.",
        "conditions": ["hypertension"],
    },

    # ── Sugars & syrups ───────────────────────────────────────────────────────
    "high fructose corn syrup": {
        "risk": "Added Sugar",
        "severity": "High",
        "category": "Added Sugar",
        "explanation": "Linked to obesity, insulin resistance, fatty liver disease, and metabolic syndrome. Metabolized differently than regular sugar.",
        "conditions": ["diabetes", "pcos", "heart_disease"],
    },
    "corn syrup": {
        "risk": "Added Sugar",
        "severity": "Medium",
        "category": "Added Sugar",
        "explanation": "High glycemic index. Contributes to blood sugar spikes and weight gain.",
        "conditions": ["diabetes", "pcos"],
    },
    "maltodextrin": {
        "risk": "Added Sugar",
        "severity": "Medium",
        "category": "Added Sugar",
        "explanation": "High glycemic index — can spike blood sugar faster than regular sugar. May affect gut bacteria.",
        "conditions": ["diabetes"],
    },

    # ── Emulsifiers & stabilizers ─────────────────────────────────────────────
    "carrageenan": {
        "risk": "Stabilizer",
        "severity": "Medium",
        "category": "Stabilizer",
        "explanation": "May cause inflammation and digestive issues. Some studies link it to gut irritation and ulcers.",
        "conditions": ["ibs"],
    },
    "polysorbate 80": {
        "risk": "Emulsifier",
        "severity": "Medium",
        "category": "Emulsifier",
        "explanation": "May disrupt gut microbiome and intestinal barrier. Associated with inflammatory bowel disease in some studies.",
        "conditions": ["ibs"],
    },
    "polysorbate 60": {
        "risk": "Emulsifier",
        "severity": "Low",
        "category": "Emulsifier",
        "explanation": "Synthetic emulsifier. May affect gut microbiome in high amounts.",
        "conditions": [],
    },
    "carboxymethyl cellulose": {
        "risk": "Emulsifier",
        "severity": "Medium",
        "category": "Emulsifier",
        "explanation": "CMC — may disrupt gut microbiome and promote inflammation in susceptible individuals.",
        "conditions": ["ibs"],
    },

    # ── Allergens ─────────────────────────────────────────────────────────────
    "wheat": {
        "risk": "Allergen / Gluten",
        "severity": "High",
        "category": "Allergen",
        "explanation": "Contains gluten. Must be avoided by those with celiac disease or gluten intolerance.",
        "conditions": ["gluten_intolerance"],
        "allergen": "Wheat",
    },
    "gluten": {
        "risk": "Allergen / Gluten",
        "severity": "High",
        "category": "Allergen",
        "explanation": "Protein found in wheat, barley, and rye. Harmful for those with celiac disease.",
        "conditions": ["gluten_intolerance"],
        "allergen": "Wheat",
    },
    "milk": {
        "risk": "Allergen / Dairy",
        "severity": "High",
        "category": "Allergen",
        "explanation": "Contains lactose and milk proteins. Can cause reactions in lactose-intolerant or dairy-allergic individuals.",
        "conditions": ["lactose_intolerance"],
        "allergen": "Milk",
    },
    "lactose": {
        "risk": "Dairy / Allergen",
        "severity": "Medium",
        "category": "Allergen",
        "explanation": "Milk sugar. Cannot be properly digested by lactose-intolerant individuals.",
        "conditions": ["lactose_intolerance"],
        "allergen": "Milk",
    },
    "casein": {
        "risk": "Dairy Protein",
        "severity": "Medium",
        "category": "Allergen",
        "explanation": "Milk protein. Can cause reactions in those with dairy allergies.",
        "conditions": ["lactose_intolerance"],
        "allergen": "Milk",
    },
    "whey": {
        "risk": "Dairy Protein",
        "severity": "Medium",
        "category": "Allergen",
        "explanation": "Milk-derived protein. May cause reactions in those with dairy allergies or lactose intolerance.",
        "conditions": ["lactose_intolerance"],
        "allergen": "Milk",
    },
    "peanut": {
        "risk": "Allergen",
        "severity": "Critical",
        "category": "Allergen",
        "explanation": "One of the most common and severe food allergens. Can cause anaphylaxis.",
        "conditions": ["nut_allergy"],
        "allergen": "Peanuts",
    },
    "peanuts": {
        "risk": "Allergen",
        "severity": "Critical",
        "category": "Allergen",
        "explanation": "Major allergen. Can cause life-threatening anaphylactic reactions.",
        "conditions": ["nut_allergy"],
        "allergen": "Peanuts",
    },
    "tree nuts": {
        "risk": "Allergen",
        "severity": "Critical",
        "category": "Allergen",
        "explanation": "Includes almonds, cashews, walnuts. Can cause severe allergic reactions.",
        "conditions": ["nut_allergy"],
        "allergen": "Tree nuts",
    },
    "almond": {
        "risk": "Allergen",
        "severity": "High",
        "category": "Allergen",
        "explanation": "Tree nut allergen. Can cause allergic reactions in nut-allergic individuals.",
        "conditions": ["nut_allergy"],
        "allergen": "Tree nuts",
    },
    "soy": {
        "risk": "Allergen",
        "severity": "High",
        "category": "Allergen",
        "explanation": "Common allergen. Also contains phytoestrogens which may affect hormonal conditions.",
        "conditions": ["pcos"],
        "allergen": "Soybeans",
    },
    "soybean": {
        "risk": "Allergen",
        "severity": "High",
        "category": "Allergen",
        "explanation": "Common food allergen. Contains phytoestrogens.",
        "conditions": ["pcos"],
        "allergen": "Soybeans",
    },
    "eggs": {
        "risk": "Allergen",
        "severity": "High",
        "category": "Allergen",
        "explanation": "Common food allergen. Can cause reactions from mild to severe.",
        "conditions": [],
        "allergen": "Eggs",
    },
    "shellfish": {
        "risk": "Allergen",
        "severity": "Critical",
        "category": "Allergen",
        "explanation": "Major allergen. Can cause severe anaphylactic reactions.",
        "conditions": [],
        "allergen": "Shellfish",
    },
    "fish": {
        "risk": "Allergen",
        "severity": "High",
        "category": "Allergen",
        "explanation": "Common allergen. Reactions can range from mild to severe.",
        "conditions": [],
        "allergen": "Fish",
    },
    "sesame": {
        "risk": "Allergen",
        "severity": "High",
        "category": "Allergen",
        "explanation": "Increasingly recognized as a major allergen. Now required to be listed on food labels.",
        "conditions": [],
        "allergen": "Sesame",
    },
}


# ── Allergen mapping ─────────────────────────────────────────────────────────
# Maps user-selected allergens to ingredient keywords to watch for
ALLERGEN_KEYWORDS = {
    "Milk":       ["milk", "dairy", "lactose", "casein", "whey", "butter", "cream", "cheese"],
    "Eggs":       ["egg", "eggs", "albumin", "mayonnaise", "lecithin"],
    "Fish":       ["fish", "cod", "salmon", "tuna", "tilapia", "anchovy"],
    "Shellfish":  ["shellfish", "shrimp", "crab", "lobster", "prawn", "squid"],
    "Tree nuts":  ["almond", "cashew", "walnut", "pecan", "pistachio", "hazelnut", "macadamia", "tree nut"],
    "Peanuts":    ["peanut", "groundnut", "arachis oil"],
    "Wheat":      ["wheat", "flour", "gluten", "semolina", "spelt", "kamut"],
    "Soybeans":   ["soy", "soya", "soybean", "tofu", "edamame", "miso"],
    "Sesame":     ["sesame", "tahini", "til", "gingelly"],
}


# ── Health condition triggers ─────────────────────────────────────────────────
# Maps health conditions to ingredient keywords that warrant personalized warnings
CONDITION_TRIGGERS = {
    "diabetes": {
        "keywords": ["sugar", "glucose", "fructose", "corn syrup", "high fructose", "dextrose",
                     "maltose", "sucrose", "honey", "molasses", "maltodextrin", "syrup"],
        "message": "This product contains high amounts of sugar or sweeteners which may cause blood sugar spikes.",
    },
    "pcos": {
        "keywords": ["soy", "soya", "soybean", "bht", "red 3", "high fructose", "sugar", "refined"],
        "message": "This product contains ingredients that may affect hormone levels, which is a concern for PCOS.",
    },
    "hypertension": {
        "keywords": ["sodium", "salt", "monosodium", "msg", "sodium benzoate", "sodium nitrate",
                     "baking soda", "sodium bicarbonate", "soy sauce"],
        "message": "This product is high in sodium which can raise blood pressure.",
    },
    "gluten_intolerance": {
        "keywords": ["wheat", "gluten", "flour", "barley", "rye", "malt", "semolina", "spelt"],
        "message": "This product contains gluten which must be avoided with gluten intolerance or celiac disease.",
    },
    "lactose_intolerance": {
        "keywords": ["milk", "lactose", "dairy", "cream", "butter", "cheese", "whey", "casein"],
        "message": "This product contains dairy ingredients which may cause digestive discomfort.",
    },
    "nut_allergy": {
        "keywords": ["peanut", "almond", "cashew", "walnut", "pecan", "hazelnut", "pistachio",
                     "nut", "groundnut"],
        "message": "This product contains nuts which can cause severe allergic reactions.",
    },
    "heart_disease": {
        "keywords": ["trans fat", "partially hydrogenated", "saturated fat", "sodium", "cholesterol",
                     "lard", "palm oil", "coconut oil"],
        "message": "This product contains ingredients that may increase cardiovascular risk.",
    },
    "ibs": {
        "keywords": ["carrageenan", "polysorbate", "sorbitol", "mannitol", "xylitol", "fructose",
                     "inulin", "fructooligosaccharides", "carboxymethyl"],
        "message": "This product contains ingredients that may trigger IBS symptoms.",
    },
}


# ── Healthier alternatives database ──────────────────────────────────────────
ALTERNATIVES = {
    "high sugar": [
        {"name": "Unsweetened version", "reason": "Lower sugar content reduces blood sugar spikes."},
        {"name": "Fruit-sweetened option", "reason": "Natural fruit sugars with added fiber and nutrients."},
        {"name": "Stevia-sweetened version", "reason": "Zero-calorie natural sweetener with no blood sugar impact."},
    ],
    "artificial colors": [
        {"name": "Naturally colored version", "reason": "Uses fruit and vegetable-derived colors instead of synthetic dyes."},
        {"name": "Plain/uncolored version", "reason": "Avoids artificial dye additives entirely."},
    ],
    "trans fat": [
        {"name": "Baked with olive oil", "reason": "Healthy monounsaturated fats instead of trans fats."},
        {"name": "Avocado oil version", "reason": "Rich in healthy fats and antioxidants."},
    ],
    "preservatives": [
        {"name": "Fresh/refrigerated version", "reason": "No preservatives needed when fresh."},
        {"name": "Naturally preserved option", "reason": "Uses vinegar or salt instead of chemical preservatives."},
    ],
    "high sodium": [
        {"name": "Low-sodium version", "reason": "Reduced sodium content for heart and kidney health."},
        {"name": "Unsalted version", "reason": "Lets you control your own sodium intake."},
    ],
}