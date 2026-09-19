from services.traceability import analyze_traceability

def test_analyze_traceability_missing_gates():
    report = analyze_traceability({}, {}, {})
    assert not report["is_valid"]
    assert len(report["missing_gates"]) == 3

def test_analyze_traceability_perfect_match():
    gate1 = {"problem_statement": "..."}
    gate2 = {"entities": [{"name": "User"}, {"name": "Order"}]}
    gate3 = {"stories": [
        {"title": "User login", "description": "The User logs in"},
        {"title": "Create Order", "description": "The User creates an Order"}
    ]}
    
    report = analyze_traceability(gate1, gate2, gate3)
    
    assert report["is_valid"]
    assert len(report["orphaned_entities"]) == 0
    assert len(report["orphaned_stories"]) == 0
    assert len(report["connections"]) == 2

def test_analyze_traceability_orphaned_entity():
    gate1 = {"problem_statement": "..."}
    gate2 = {"entities": [{"name": "User"}, {"name": "Payment"}]}
    gate3 = {"stories": [
        {"title": "User login", "description": "The User logs in"}
    ]}
    
    report = analyze_traceability(gate1, gate2, gate3)
    
    assert not report["is_valid"]
    assert "Payment" in report["orphaned_entities"]
    assert len(report["orphaned_stories"]) == 0

def test_analyze_traceability_orphaned_story():
    gate1 = {"problem_statement": "..."}
    gate2 = {"entities": [{"name": "User"}]}
    gate3 = {"stories": [
        {"title": "User login", "description": "The User logs in"},
        {"title": "Configure settings", "description": "Change theme colors"}
    ]}
    
    report = analyze_traceability(gate1, gate2, gate3)
    
    assert not report["is_valid"]
    assert len(report["orphaned_entities"]) == 0
    assert "Configure settings" in report["orphaned_stories"]
