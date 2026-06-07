import os
from fpdf import FPDF
from datetime import datetime

def clean_pdf_text(text: str) -> str:
    if not text:
        return ""
    # Map common medical/emergency emojis and non-latin-1 to text equivalents
    replacements = {
        "🚨": "[EMERGENCY]",
        "⚠️": "[WARNING]",
        "📋": "[RECOMMENDATION]",
        "ℹ️": "[INFO]",
        "•": "-",  # standard bullet point
    }
    for emoji, rep in replacements.items():
        text = text.replace(emoji, rep)
    
    # Strip any other characters outside Latin-1 to prevent fpdf UnicodeEncodeError
    cleaned = []
    for char in text:
        try:
            char.encode('latin-1')
            cleaned.append(char)
        except UnicodeEncodeError:
            pass  # Skip unsupported chars
    return "".join(cleaned)


class BrainAIReportPDF(FPDF):
    def header(self):
        # Professional Clinical Header
        self.set_font("Helvetica", "B", 15)
        self.set_text_color(26, 54, 93) # Dark Navy blue
        self.cell(0, 10, "COMPREHENSIVE BRAIN CT ANALYSIS SYSTEM PORTAL", ln=True, align="C")
        
        self.set_font("Helvetica", "", 9)
        self.set_text_color(113, 128, 150) # Slate gray
        self.cell(0, 4, "Automated Detection & Classification of Intracranial Hemorrhages with Integrated Clinical Risk Assessment", ln=True, align="C")
        self.ln(4)
        
        # Header divider line
        self.set_draw_color(226, 232, 240) # Slate-200 border
        self.line(10, 28, 200, 28)
        self.ln(5)

    def footer(self):
        # Professional Hospital Footer
        self.set_y(-25)
        self.set_font("Helvetica", "I", 8)
        self.set_text_color(160, 174, 192) # Soft gray
        self.cell(0, 4, "CONFIDENTIAL & SECURE DIAGNOSTIC REPORT - INTENDED FOR EXPERT CLINICAL REVIEW ONLY", ln=True, align="C")
        self.cell(0, 4, "Disclaimer: Automated assessment using deep feature extraction. Always correlate findings with patient symptoms and expert radiological consensus.", ln=True, align="C")
        self.cell(0, 5, f"Page {self.page_no()}", ln=True, align="R")

def generate_pdf_report(report, user, output_path: str):
    """
    Assembles a gorgeous, multi-column clinical report in PDF format,
    incorporating side-by-side scanning views and localized heatmaps.
    """
    pdf = BrainAIReportPDF()
    pdf.add_page()
    
    # 1. Patient & Scan metadata
    pdf.ln(4)
    pdf.set_font("Helvetica", "B", 11)
    pdf.set_text_color(26, 54, 93) # Navy blue
    pdf.cell(0, 6, "I. PATIENT & CLINICAL METADATA", ln=True)
    pdf.ln(2)
    
    # Render Patient Metadata Grid
    pdf.set_font("Helvetica", "B", 9)
    pdf.set_text_color(74, 85, 104) # Slate-600
    
    # Row 1
    pdf.set_fill_color(248, 250, 252) # Light blue-gray background
    pdf.cell(30, 7, " Patient Name:", border="LTB", fill=True)
    pdf.set_font("Helvetica", "", 9)
    pdf.cell(65, 7, f" {clean_pdf_text(user.name)}", border="RTB", fill=True)
    
    pdf.set_font("Helvetica", "B", 9)
    pdf.cell(30, 7, " Patient Email:", border="LTB", fill=True)
    pdf.set_font("Helvetica", "", 9)
    pdf.cell(65, 7, f" {clean_pdf_text(user.email)}", border="RTB", fill=True)
    pdf.ln()
    
    # Row 2
    pdf.set_font("Helvetica", "B", 9)
    pdf.cell(30, 7, " Report ID:", border="LTB")
    pdf.set_font("Helvetica", "", 9)
    pdf.cell(65, 7, f" BHD-#{report.id:06d}", border="RTB")
    
    pdf.set_font("Helvetica", "B", 9)
    pdf.cell(30, 7, " Analysis Date:", border="LTB")
    pdf.set_font("Helvetica", "", 9)
    pdf.cell(65, 7, f" {report.created_at.strftime('%Y-%m-%d %H:%M:%S UTC')}", border="RTB")
    pdf.ln()
    
    # Row 3
    pdf.set_font("Helvetica", "B", 9)
    pdf.cell(30, 7, " Imaging Mode:", border="LTB", fill=True)
    pdf.set_font("Helvetica", "", 9)
    pdf.cell(65, 7, " Brain CT / MRI Scan", border="RTB", fill=True)
    
    pdf.set_font("Helvetica", "B", 9)
    pdf.cell(30, 7, " System Core:", border="LTB", fill=True)
    pdf.set_font("Helvetica", "", 9)
    pdf.cell(65, 7, " PyTorch CPU-Inference", border="RTB", fill=True)
    pdf.ln()
    
    pdf.ln(5)
    
    # 2. Main Diagnostics Section
    pdf.set_font("Helvetica", "B", 11)
    pdf.set_text_color(26, 54, 93) # Navy blue
    pdf.cell(0, 6, "II. CLINICAL ASSESSMENT & FINDINGS", ln=True)
    pdf.ln(2)
    
    # High-impact highlight box for key diagnosis
    pdf.set_font("Helvetica", "B", 12)
    if "Hemorrhage Detected" in report.prediction:
        pdf.set_text_color(220, 38, 38) # Red-600
        result_text = "WARNING: ACUTE BRAIN HEMORRHAGE DETECTED"
        bg_color = (254, 242, 242) # Red-50 fill
        border_color = (252, 165, 165) # Red-300 border
    else:
        pdf.set_text_color(22, 101, 52) # Green-700
        result_text = "NORMAL SCAN: NO INTRACRANIAL HEMORRHAGE DETECTED"
        bg_color = (240, 253, 244) # Green-50 fill
        border_color = (187, 247, 208) # Green-200 border
        
    y = pdf.get_y()
    pdf.set_fill_color(*bg_color)
    pdf.set_draw_color(*border_color)
    pdf.rect(10, y, 190, 12, "FD")
    
    pdf.set_xy(14, y + 3)
    pdf.cell(0, 6, clean_pdf_text(result_text), ln=True)
    
    pdf.set_xy(10, y + 12)
    pdf.ln(4)
    
    # Grid of Metrics
    pdf.set_draw_color(226, 232, 240) # Slate border
    pdf.set_font("Helvetica", "B", 9.5)
    pdf.set_text_color(74, 85, 104) # Slate-600
    pdf.set_fill_color(241, 245, 249) # Slate-100 table header
    
    # Table headers
    pdf.cell(50, 7, " Diagnostic Index", border=1, align="L", fill=True)
    pdf.cell(50, 7, "Estimated Value", border=1, align="C", fill=True)
    pdf.cell(90, 7, " Clinical Interpretation", border=1, align="L", fill=True)
    pdf.ln()
    
    pdf.set_font("Helvetica", "", 8.5)
    pdf.set_text_color(51, 65, 85) # Slate-800
    
    # Confidence Score row
    pdf.cell(50, 7, " Inference Confidence", border=1, align="L")
    pdf.cell(50, 7, f"{report.confidence}%", border=1, align="C")
    pdf.cell(90, 7, " AI confidence of classification based on deep network features.", border=1)
    pdf.ln()
    
    # Hemorrhage Detection Score row
    pdf.cell(50, 7, " Hemorrhage Detection Score", border=1, align="L")
    pdf.cell(50, 7, f"{report.hemorrhage_detection_score or 0.0}%", border=1, align="C")
    pdf.cell(90, 7, " Estimated likelihood/presence score of brain hemorrhage.", border=1)
    pdf.ln()
    
    # Severity row
    pdf.cell(50, 7, " Hemorrhage Severity Index", border=1, align="L")
    pdf.cell(50, 7, f"{report.hemorrhage_percentage}%", border=1, align="C")
    pdf.cell(90, 7, " Cross-sectional percentage of brain tissue affected by bleeding.", border=1)
    pdf.ln()
    
    # Stroke Risk row
    pdf.cell(50, 7, " Stroke Risk Probability", border=1, align="L")
    pdf.cell(50, 7, f"{report.stroke_risk}%", border=1, align="C")
    pdf.cell(90, 7, f" Patient presents a {report.risk_level} stroke risk level.", border=1)
    pdf.ln()
    
    # Epilepsy Risk row
    pdf.cell(50, 7, " Epilepsy Risk Probability", border=1, align="L")
    pdf.cell(50, 7, f"{report.epilepsy_risk}%", border=1, align="C")
    pdf.cell(90, 7, " Post-hemorrhage seizure occurrence risk assessment.", border=1)
    pdf.ln()
    
    # Intervention Delay Index row
    pdf.cell(50, 7, " Intervention Delay Index (IDI)", border=1, align="L")
    pdf.cell(50, 7, f"{getattr(report, 'idi', 0.0):.4f}", border=1, align="C")
    pdf.cell(90, 7, " Urgency index based on hemorrhage type probabilities and presence.", border=1)
    pdf.ln()
    
    # Treatment Recommendation row
    pdf.cell(50, 7, " Recommended Care Timeline", border=1, align="L")
    pdf.cell(50, 7, f"{clean_pdf_text(getattr(report, 'treatment_recommendation', 'Routine (>24 hours)'))}", border=1, align="C")
    pdf.cell(90, 7, " Immediate, Urgent, Semi-Urgent, or Routine action recommendation.", border=1)
    pdf.ln()

    # Hematoma Expansion Rate row
    pdf.cell(50, 7, " Hematoma Expansion Rate (HER)", border=1, align="L")
    pdf.cell(50, 7, f"{getattr(report, 'her', 0.0):.2f}%", border=1, align="C")
    pdf.cell(90, 7, " Predicted risk of rapid bleeding volume expansion.", border=1)
    pdf.ln()

    # Seizure Risk Score row
    pdf.cell(50, 7, " Seizure Risk Score (SRS)", border=1, align="L")
    pdf.cell(50, 7, f"{getattr(report, 'srs', 0.0):.4f}", border=1, align="C")
    pdf.cell(90, 7, " Estimates long-term seizure risk based on proximity and hemorrhage type.", border=1)
    pdf.ln()
    
    # Hemorrhage Location row
    pdf.cell(50, 7, " Hemorrhage Location", border=1, align="L")
    pdf.cell(50, 7, f"{clean_pdf_text(report.hemorrhage_location)}", border=1, align="C")
    pdf.cell(90, 7, f" Confidence: {int(report.location_confidence * 100)}% in anatomical classification.", border=1)
    pdf.ln()
    
    # Model Accuracy row
    pdf.cell(50, 7, " Model Accuracy", border=1, align="L")
    pdf.cell(50, 7, f"{report.model_accuracy}%", border=1, align="C")
    pdf.cell(90, 7, f" Dataset: {report.dataset_source}", border=1)
    pdf.ln()
    
    pdf.ln(4)
    
    # 3. Clinician validation section (if reviewed)
    has_review = (report.doctor_approved != "pending")
    if has_review:
        pdf.set_font("Helvetica", "B", 11)
        pdf.set_text_color(26, 54, 93) # Navy blue
        pdf.cell(0, 6, "III. CLINICAL REVIEW & VALIDATION", ln=True)
        pdf.ln(2)
        
        if report.doctor_approved == "approved":
            pdf.set_fill_color(240, 253, 244) # Emerald-50
            pdf.set_draw_color(187, 247, 208) # Emerald-200
        else:
            pdf.set_fill_color(254, 242, 242) # Rose-50
            pdf.set_draw_color(252, 165, 165) # Rose-200
            
        pdf.set_font("Helvetica", "B", 9)
        pdf.set_text_color(51, 65, 85)
        pdf.cell(40, 6.5, " Clinician Status:", border="LT", fill=True)
        pdf.set_font("Helvetica", "", 9)
        status_lbl = "Approved & Verified AI Findings" if report.doctor_approved == "approved" else "Rejected / Overridden AI Findings"
        pdf.cell(150, 6.5, f" {clean_pdf_text(status_lbl)}", border="RT", fill=True, ln=True)
        
        pdf.set_font("Helvetica", "B", 9)
        pdf.cell(40, 6.5, " Clinician Diagnosis:", border="L", fill=True)
        pdf.set_font("Helvetica", "", 9)
        pdf.cell(150, 6.5, f" {clean_pdf_text(report.doctor_diagnosis or 'No diagnosis provided.')}", border="R", fill=True, ln=True)
        
        pdf.set_font("Helvetica", "B", 9)
        pdf.cell(40, 6.5, " Review Notes:", border="LB", fill=True)
        pdf.set_font("Helvetica", "", 9)
        pdf.cell(150, 6.5, f" {clean_pdf_text(report.doctor_notes or 'No notes provided.')}", border="RB", fill=True, ln=True)
        pdf.ln(4)

    # 4. First-Aid Recommendations Section (if emergency)
    if report.first_aid_needed or report.is_emergency:
        pdf.set_font("Helvetica", "B", 11)
        pdf.set_text_color(220, 38, 38)  # Red for emergency
        sec_num = "IV" if has_review else "III"
        pdf.cell(0, 6, f"{sec_num}. EMERGENCY FIRST-AID RECOMMENDATIONS", ln=True)
        pdf.ln(2)
        
        pdf.set_fill_color(254, 242, 242)  # Red-50
        pdf.set_draw_color(252, 165, 165)  # Red-200
        pdf.set_text_color(153, 27, 27)    # Crimson text
        pdf.set_font("Helvetica", "", 9)
        pdf.multi_cell(0, 5.5, f" {clean_pdf_text(report.first_aid_recommendations)}", border=1, align="L", fill=True)
        pdf.ln(4)
    
    # 5. Visualizations Section (Forced page break to guarantee beautiful centering on Page 2)
    pdf.add_page()
    
    pdf.set_font("Helvetica", "B", 11)
    pdf.set_text_color(26, 54, 93) # Navy blue
    
    sec_num_idx = 3
    if has_review:
        sec_num_idx += 1
    if report.first_aid_needed or report.is_emergency:
        sec_num_idx += 1
    roman_numerals = {3: "III", 4: "IV", 5: "V"}
    sec_num = roman_numerals.get(sec_num_idx, "IV")
    
    pdf.cell(0, 6, f"{sec_num}. SCANS & GRAD-CAM VISUALIZATIONS", ln=True)
    pdf.ln(3)
    
    image_y = pdf.get_y()
    img_w = 82
    img_h = 82
    x1 = 15
    x2 = 113
    
    # Embed original scan (Left Column)
    if os.path.exists(report.image_path):
        pdf.image(report.image_path, x=x1, y=image_y, w=img_w, h=img_h)
        pdf.set_xy(x1, image_y + img_h + 2)
        pdf.set_font("Helvetica", "B", 8.5)
        pdf.set_text_color(100, 116, 139)
        pdf.cell(img_w, 5, "Figure A: Original CT/MRI Scan Input", ln=False, align="C")
        
    # Embed Grad-CAM Heatmap (Right Column)
    if os.path.exists(report.heatmap_path):
        pdf.image(report.heatmap_path, x=x2, y=image_y, w=img_w, h=img_h)
        pdf.set_xy(x2, image_y + img_h + 2)
        pdf.set_font("Helvetica", "B", 8.5)
        pdf.set_text_color(100, 116, 139)
        pdf.cell(img_w, 5, "Figure B: Hybrid Grad-CAM Localization Map", ln=True, align="C")
        
    pdf.set_xy(10, image_y + img_h + 10)
    pdf.ln(4)
    
    # Visual Notes explaining Grad-CAM maps
    pdf.set_font("Helvetica", "", 8.5)
    pdf.set_text_color(148, 163, 184) # Slate-400
    pdf.multi_cell(0, 4.5, "Visualization Guide: The Grad-CAM heatmap highlights active spatial regions driving the model prediction. Red/hot-colored focal spots indicate highly suspicious tissue density zones corresponding to hyperdense hematoma accumulations. Green/blue signals show low-probability texture contexts.", align="C")
    
    # Save the file
    pdf.output(output_path)