# PROMPTS = {
#     "1":  "गेहूं की फसल के बारे में बुनियादी जानकारी ठीक 20 शब्दों में हिंदी में दें। किसान के अनुकूल भाषा में लिखें।",
#     "2":  "किसानों से संबंधित एक हालिया सनसनीखेज समाचार शीर्षक हिंदी में लिखें, जो 20 से 30 शब्दों का हो। केवल शीर्षक लिखें किसी भी न्यूज़ पेपर की, और कुछ नहीं।",
#     "3":  "कपास की खेती में उपयोग होने वाले उर्वरक के बारे में ठीक 20 शब्दों में हिंदी में बताएं। संक्षिप्त और व्यावहारिक रहें।",
#     "4":  "आज के प्रमुख अनाज मंडियों में गेहूं, धान और सरसों के अनुमानित भाव ठीक 20 शब्दों में हिंदी में बताएं।",
#     "5":  "उत्तर भारत के किसानों के लिए आज के मौसम का संक्षिप्त अनुमान ठीक 20 शब्दों में हिंदी में दें।",
#     "6":  "गेहूं और धान की फसल में लगने वाले 2 प्रमुख रोगों के नाम और एक-एक लक्षण ठीक 20 शब्दों में हिंदी में बताएं।",
#     "7":  "खरीफ फसलों के लिए सही सिंचाई के 2 व्यावहारिक सुझाव ठीक 20 शब्दों में हिंदी में दें।",
#     "8":  "रबी फसलों की बुआई के लिए उचित समय और मिट्टी की तैयारी के बारे में ठीक 20 शब्दों में हिंदी में बताएं।",
#     "9":  "किसानों के लिए 2 प्रमुख सरकारी योजनाओं के नाम और एक-एक लाभ ठीक 20 शब्दों में हिंदी में बताएं।",
#     "10": "प्रधानमंत्री फसल बीमा योजना के बारे में ठीक 20 शब्दों में हिंदी में बताएं। सरल और स्पष्ट भाषा में।",
# }

# # Short menu names, shown on screen and read aloud as "<label> के लिए <key> दबाएं".
# # Keep each one a noun phrase so that sentence reads naturally.
# MENU_LABELS = {
#     "1":  "गेहूं की फसल की जानकारी",
#     "2":  "किसानों से जुड़ी ताज़ा खबर",
#     "3":  "कपास की खेती में खाद की जानकारी",
#     "4":  "आज के मंडी भाव",
#     "5":  "आज का मौसम",
#     "6":  "गेहूं और धान के प्रमुख रोग",
#     "7":  "खरीफ फसलों की सिंचाई",
#     "8":  "रबी फसलों की बुआई",
#     "9":  "किसानों के लिए सरकारी योजनाएं",
#     "10": "प्रधानमंत्री फसल बीमा योजना",
# }
import re

PROMPTS = {
    "1":  "गेहूं की फसल के बारे में बुनियादी जानकारी ठीक 20 शब्दों में हिंदी में दें। किसान के अनुकूल भाषा में लिखें।",
    "2":  "किसानों से संबंधित एक हालिया सनसनीखेज समाचार शीर्षक हिंदी में लिखें, जो 20 से 30 शब्दों का हो। केवल शीर्षक लिखें किसी भी न्यूज़ पेपर की, और कुछ नहीं।",
    "3":  "कपास की खेती में उपयोग होने वाले उर्वरक के बारे में ठीक 20 शब्दों में हिंदी में बताएं। संक्षिप्त और व्यावहारिक रहें।",
    "4":  "आज के प्रमुख अनाज मंडियों में गेहूं, धान और सरसों के अनुमानित भाव ठीक 20 शब्दों में हिंदी में बताएं।",
    "5":  "उत्तर भारत के किसानों के लिए आज के मौसम का संक्षिप्त अनुमान ठीक 20 शब्दों में हिंदी में दें।",
    "6":  "गेहूं और धान की फसल में लगने वाले 2 प्रमुख रोगों के नाम और एक-एक लक्षण ठीक 20 शब्दों में हिंदी में बताएं।",
    "7":  "खरीफ फसलों के लिए सही सिंचाई के 2 व्यावहारिक सुझाव ठीक 20 शब्दों में हिंदी में दें।",
    "8":  "रबी फसलों की बुआई के लिए उचित समय और मिट्टी की तैयारी के बारे में ठीक 20 शब्दों में हिंदी में बताएं।",
    "9":  "किसानों के लिए 2 प्रमुख सरकारी योजनाओं के नाम और एक-एक लाभ ठीक 20 शब्दों में हिंदी में बताएं।",
    "10": "प्रधानमंत्री फसल बीमा योजना के बारे में ठीक 20 शब्दों में हिंदी में बताएं। सरल और स्पष्ट भाषा में।",
}

# Short menu names, shown on screen and read aloud as "<label> के लिए <key> दबाएं".
# Keep each one a noun phrase so that sentence reads naturally.
MENU_LABELS = {
    "1":  "गेहूं की फसल की जानकारी",
    "2":  "किसानों से जुड़ी ताज़ा खबर",
    "3":  "कपास की खेती में खाद की जानकारी",
    "4":  "आज के मंडी भाव",
    "5":  "आज का मौसम",
    "6":  "गेहूं और धान के प्रमुख रोग",
    "7":  "खरीफ फसलों की सिंचाई",
    "8":  "रबी फसलों की बुआई",
    "9":  "किसानों के लिए सरकारी योजनाएं",
    "10": "प्रधानमंत्री फसल बीमा योजना",
}


# ---------------------------------------------------------------------------
# Personalised prompts
#
# LOCAL_PROMPTS holds the same questions as PROMPTS, written for one place.
# "{place}" is filled from the logged-in user's city / state / country.
#
# Left out on purpose: 2 (news), 4 (mandi prices) and 5 (weather) need live data.
# Adding a place there would make invented headlines, prices and forecasts look
# more believable, so they stay as they are until real data is plugged in.
# 10 (PM Fasal Bima) is a nationwide scheme, so it stays generic too.
# ---------------------------------------------------------------------------
LOCAL_PROMPTS = {
    "1": "{place} के किसानों के लिए गेहूं की फसल की बुनियादी जानकारी ठीक 20 शब्दों में हिंदी में दें। किसान के अनुकूल भाषा में लिखें।",
    "3": "{place} के किसानों के लिए कपास की खेती में उपयोग होने वाले उर्वरक के बारे में ठीक 20 शब्दों में हिंदी में बताएं। संक्षिप्त और व्यावहारिक रहें।",
    "6": "{place} के किसानों के लिए गेहूं और धान की फसल में लगने वाले 2 प्रमुख रोगों के नाम और एक-एक लक्षण ठीक 20 शब्दों में हिंदी में बताएं।",
    "7": "{place} के किसानों के लिए खरीफ फसलों की सही सिंचाई के 2 व्यावहारिक सुझाव ठीक 20 शब्दों में हिंदी में दें।",
    "8": "{place} के किसानों के लिए रबी फसलों की बुआई का उचित समय और मिट्टी की तैयारी के बारे में ठीक 20 शब्दों में हिंदी में बताएं।",
    "9": "{place} के किसानों के लिए 2 प्रमुख सरकारी योजनाओं के नाम और एक-एक लाभ ठीक 20 शब्दों में हिंदी में बताएं। केवल वही योजनाएं बताएं जिनके बारे में आपको पक्का पता हो, अनुमान से कोई राशि न लिखें।",
}

# The profile text goes into the prompt, so line breaks, quotes and brackets are removed
# and each part is capped. (Hindi letters and their vowel signs are kept.)
_UNSAFE_CHARS = re.compile(r"[\x00-\x1f\x7f{}<>`\"]")
MAX_PLACE_PART = 60


def _clean_part(value):
    if not value:
        return None
    text = _UNSAFE_CHARS.sub(" ", str(value))
    text = " ".join(text.split())
    return text[:MAX_PLACE_PART].strip() or None


def get_place(user):
    """'Ludhiana, Punjab' from the user's profile. Falls back to the country, then to None."""
    city = _clean_part(getattr(user, "city", None))
    state = _clean_part(getattr(user, "state", None))
    country = _clean_part(getattr(user, "country", None))

    parts = []
    for part in (city, state):
        if part and part.casefold() not in (p.casefold() for p in parts):
            parts.append(part)
    if not parts and country:
        parts.append(country)

    return ", ".join(parts) or None


def build_prompt(key, user):
    """The prompt text for this menu key, or None if the key does not exist.

    Uses the personalised version when it exists and the user has a place saved;
    otherwise the original prompt, exactly as before.
    """
    base = PROMPTS.get(key)
    if not base:
        return None

    template = LOCAL_PROMPTS.get(key)
    place = get_place(user)
    if template and place:
        return template.format(place=place)

    return base
