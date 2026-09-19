from typing import Dict, List, Any

def analyze_traceability(gate1: dict, gate2: dict, gate3: dict) -> dict:
    """
    Cross-reference artifacts to generate a Requirements Traceability Matrix (RTM).
    """
    report = {
        "is_valid": True,
        "missing_gates": [],
        "orphaned_entities": [],
        "orphaned_stories": [],
        "connections": []
    }

    if not gate1:
        report["missing_gates"].append("Gate 1 (Business Requirements)")
    if not gate2:
        report["missing_gates"].append("Gate 2 (Data Dictionary)")
    if not gate3:
        report["missing_gates"].append("Gate 3 (User Stories)")

    if report["missing_gates"]:
        report["is_valid"] = False
        return report

    entities = gate2.get("entities", [])
    stories = gate3.get("stories", [])

    entity_names = [e["name"].lower() for e in entities]
    
    # Track which entities are used in which stories
    entity_usage = {name: [] for name in entity_names}
    
    for idx, story in enumerate(stories):
        story_text = f"{story.get('title', '')} {story.get('description', '')} {story.get('given', '')} {story.get('when', '')} {story.get('then', '')}".lower()
        
        used_entities = []
        for e_name in entity_names:
            # simple substring match for MVP
            if e_name in story_text:
                used_entities.append(e_name)
                entity_usage[e_name].append(story.get("title"))
                
        if not used_entities:
            report["orphaned_stories"].append(story.get("title"))
            report["is_valid"] = False
        else:
            report["connections"].append({
                "story": story.get("title"),
                "entities": used_entities
            })

    for e_name, used_in in entity_usage.items():
        if not used_in:
            report["orphaned_entities"].append(next(e["name"] for e in entities if e["name"].lower() == e_name))
            report["is_valid"] = False

    return report
