package com.franchiseintel.enums;

public enum StockStatus {
    ALL,
    ENOUGH("ENOUGH_STOCK"),
    LOW("LOW_STOCK"),
    OUT("OUT_OF_STOCK");
    
    private final String displayValue;
    
    StockStatus() {
        this.displayValue = this.name();
    }
    
    StockStatus(String displayValue) {
        this.displayValue = displayValue;
    }
    
    public String getDisplayValue() {
        return displayValue;
    }
}
