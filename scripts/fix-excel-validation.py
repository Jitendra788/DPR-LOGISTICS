"""Relax Excel data validation so BA / Vendor sheets can be edited freely."""
from copy import copy
from openpyxl import load_workbook
from openpyxl.worksheet.datavalidation import DataValidation

BA_FILES = [
    r"e:\project\vmcindia\BA_Selection_Criteria_DPR_Logistics.xlsx",
    r"c:\Users\jiten\Downloads\BA_Selection_Criteria_DPR_Logistics.xlsx",
    r"c:\Users\jiten\Downloads\BA Selection Criteria - V2.1.xlsx",
]
VENDOR_FILES = [
    r"e:\project\vmcindia\Vendor_Company_Master_Filled.xlsx",
    r"c:\Users\jiten\Downloads\Vendor_Company_Master_Filled.xlsx",
    r"e:\project\vmcindia\Vendor_Company_Master.xlsx",
]

# Exact option lists (no INDIRECT — works after openpyxl save)
BA_LISTS = {
    "E15": "1. Limited Company,2. Private Limited,3. LLP,4. Sole Proprietorship,5. Father & Sons Partnership,6. Partnership",
    "E16": "1. Less than 40 Yrs,2. 40 - 50 Yrs,3. Greater than 50 Yrs",
    "E17": "1. Less than 5 years,2. 5 to 10 years,3. Greater than 10 years",
    "E18": "1. Total Logistic Service,2. Diversified Business,3. Only FTL,4. FTL / LTL",
    "E19": "Both PSU's & MNC/Pvt Co,Only MNC's/Pvt Co,Only PSU's",
    "E20": "< 50 Cr,> 100  Cr.,50 - 70 Cr.",
    "E21": "< 30 Cr,> 50 Cr,30 - 50 Cr",
    "E22": "Local,National,Regional",
    "E23": "< 20,>50,20 - 49",
    "E24": "< 100,> 300,100 - 299",
    "E25": "Management & inter office connectivity,Use Financial Software,No Financial Software",
    "E26": "Yes,No",
    "E27": "Auto alerts for Exception & System generated MIS,Manual MIS & Tracking,No MIS,System generated MIS",
    "E28": "Yes,No",
    "E29": "Yes,No",
    "E30": "Yes,No",
}


def soft_list(formula: str, cells: str) -> DataValidation:
    dv = DataValidation(
        type="list",
        formula1=f'"{formula}"',
        allow_blank=True,
        showDropDown=False,  # False = show dropdown arrow in Excel
        showErrorMessage=True,
        showInputMessage=True,
    )
    # warning = can still save a custom value after Retry/Ignore
    dv.errorStyle = "warning"
    dv.errorTitle = "Select from list"
    dv.error = "Best: pick from dropdown. You can still type a custom value (Yes / Continue)."
    dv.promptTitle = "Choose option"
    dv.prompt = "Select from dropdown, or type your own value"
    dv.add(cells)
    return dv


def fix_ba(path: str) -> None:
    try:
        wb = load_workbook(path)
    except (PermissionError, FileNotFoundError) as err:
        print("SKIP load:", path, err)
        return
    ws = wb["GUI"]
    # Clear all old validations (broken INDIRECT ones)
    ws.data_validations.dataValidation = []
    for cell, formula in BA_LISTS.items():
        ws.add_data_validation(soft_list(formula, cell))
    try:
        wb.save(path)
        print("BA fixed:", path)
    except PermissionError:
        alt = path.replace(".xlsx", "_Editable.xlsx")
        wb.save(alt)
        print("BA locked, saved editable copy:", alt)


def fix_vendor(path: str) -> None:
    try:
        wb = load_workbook(path)
    except (PermissionError, FileNotFoundError) as err:
        print("SKIP:", path, err)
        return
    ws = wb.active
    ws.data_validations.dataValidation = []
    ws.add_data_validation(
        soft_list("RCM - NO GST ON BILLS,FCM - GST ON BILLS", "H2:H50")
    )
    try:
        wb.save(path)
        print("Vendor fixed:", path)
    except PermissionError:
        alt = path.replace(".xlsx", "_Editable.xlsx")
        wb.save(alt)
        print("Vendor locked, saved editable copy:", alt)


for p in BA_FILES:
    fix_ba(p)
for p in VENDOR_FILES:
    fix_vendor(p)

print("Done. Close Excel and reopen the file if it was already open.")
