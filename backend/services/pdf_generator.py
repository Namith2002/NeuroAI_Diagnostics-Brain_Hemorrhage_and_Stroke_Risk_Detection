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
        self.cell(0, 10, "NEUROAI CLINICAL DIAGNOSTIC PORTAL", ln=True, align="C")
        
        self.set_font("Helvetica", "", 9)
        self.set_text_color(113, 128, 150) # Slate gray
        self.cell(0, 4, "Automated Brain Hemorrhage & Stroke Risk Assessment Tool", ln=True, align="C")
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
    pdf.set_font("Helvetica", "B", 10.5)
    pdf.set_text_color(45, 55, 72) # Slate-700
    pdf.cell(0, 6, "I. PATIENT & SCAN METADATA", ln=True)
    
    pdf.set_fill_color(248, 250, 252) # Slate-50 background fill
    pdf.rect(10, 40, 190, 26, "F")
    
    pdf.set_xy(12, 42)
    pdf.set_font("Helvetica", "B", 9.5)
    pdf.cell(25, 6, "Patient Name:", ln=False)
    pdf.set_font("Helvetica", "", 9.5)
    pdf.cell(70, 6, clean_pdf_text(user.name), ln=False)
    
    pdf.set_font("Helvetica", "B", 9.5)
    pdf.cell(25, 6, "Patient Email:", ln=False)
    pdf.set_font("Helvetica", "", 9.5)
    pdf.cell(70, 6, clean_pdf_text(user.email), ln=True)
    
    pdf.set_x(12)
    pdf.set_font("Helvetica", "B", 9.5)
    pdf.cell(25, 6, "Report ID:", ln=False)
    pdf.set_font("Helvetica", "", 9.5)
    pdf.cell(70, 6, f"BHD-#{report.id:06d}", ln=False)
    
    pdf.set_font("Helvetica", "B", 9.5)
    pdf.cell(25, 6, "Analysis Date:", ln=False)
    pdf.set_font("Helvetica", "", 9.5)
    pdf.cell(70, 6, report.created_at.strftime('%Y-%m-%d %H:%M:%S UTC'), ln=True)
    
    pdf.set_x(12)
    pdf.set_font("Helvetica", "B", 9.5)
    pdf.cell(25, 6, "Imaging Mode:", ln=False)
    pdf.set_font("Helvetica", "", 9.5)
    pdf.cell(70, 6, "Brain CT / MRI Scan", ln=False)
    
    pdf.set_font("Helvetica", "B", 9.5)
    pdf.cell(25, 6, "System Core:", ln=False)
    pdf.set_font("Helvetica", "", 9.5)
    pdf.cell(70, 6, "PyTorch CPU-Inference", ln=True)
    
    pdf.set_xy(10, 68)
    pdf.ln(5)
    
    # 2. Main Diagnostics Section
    pdf.set_font("Helvetica", "B", 10.5)
    pdf.set_text_color(45, 55, 72)
    pdf.cell(0, 6, "II. CLINICAL ASSESSMENT & FINDINGS", ln=True)
    
    # High-impact highlight box for key diagnosis
    pdf.set_font("Helvetica", "B", 13)
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
    pdf.rect(10, y, 190, 13, "FD")
    
    pdf.set_xy(14, y + 3.5)
    pdf.cell(0, 6, clean_pdf_text(result_text), ln=True)
    
    pdf.set_xy(10, y + 15)
    pdf.ln(3)
    
    # Grid of Metrics
    pdf.set_draw_color(226, 232, 240) # Slate border
    pdf.set_font("Helvetica", "B", 9.5)
    pdf.set_text_color(74, 85, 104) # Slate-600
    pdf.set_fill_color(241, 245, 249) # Slate-100 table header
    
    # Table headers
    pdf.cell(50, 7, "Diagnostic Index", border=1, align="C", fill=True)
    pdf.cell(40, 7, "Estimated Value", border=1, align="C", fill=True)
    pdf.cell(100, 7, "Clinical Interpretation", border=1, align="C", fill=True)
    pdf.ln()
    
    pdf.set_font("Helvetica", "", 9)
    pdf.set_text_color(51, 65, 85) # Slate-800
    
    # Confidence Score row
    pdf.cell(50, 7, "Inference Confidence", border=1, align="C")
    pdf.cell(40, 7, f"{report.confidence}%", border=1, align="C")
    pdf.cell(100, 7, " AI confidence of classification based on deep network features.", border=1)
    pdf.ln()
    
    # Severity row
    pdf.cell(50, 7, "Hemorrhage Severity Index", border=1, align="C")
    pdf.cell(40, 7, f"{report.hemorrhage_percentage}%", border=1, align="C")
    pdf.cell(100, 7, " Cross-sectional percentage of brain tissue affected by bleeding.", border=1)
    pdf.ln()
    
    # Stroke Risk row
    pdf.cell(50, 7, "Stroke Risk Probability", border=1, align="C")
    pdf.cell(40, 7, f"{report.stroke_risk}%", border=1, align="C")
    pdf.cell(100, 7, f" Patient presents a {report.risk_level} stroke risk level.", border=1)
    pdf.ln()
    
    # Epilepsy Risk row
    pdf.cell(50, 7, "Epilepsy Risk Probability", border=1, align="C")
    pdf.cell(40, 7, f"{report.epilepsy_risk}%", border=1, align="C")
    pdf.cell(100, 7, " Post-hemorrhage seizure occurrence risk assessment.", border=1)
    pdf.ln()
    
    # Hemorrhage Location row
    pdf.cell(50, 7, "Hemorrhage Location", border=1, align="C")
    pdf.cell(40, 7, f"{clean_pdf_text(report.hemorrhage_location)}", border=1, align="C")
    pdf.cell(100, 7, f" Confidence: {int(report.location_confidence * 100)}% in anatomical classification.", border=1)
    pdf.ln()
    
    # Model Accuracy row
    pdf.cell(50, 7, "Model Accuracy", border=1, align="C")
    pdf.cell(40, 7, f"{report.model_accuracy}%", border=1, align="C")
    pdf.cell(100, 7, f" Dataset: {report.dataset_source}", border=1)
    pdf.ln()
    
    pdf.ln(4)
    
    # 4. First-Aid Recommendations Section (if emergency)
    if report.first_aid_needed or report.is_emergency:
        pdf.set_font("Helvetica", "B", 10.5)
        pdf.set_text_color(220, 38, 38)  # Red for emergency
        pdf.cell(0, 6, "IV. EMERGENCY FIRST-AID RECOMMENDATIONS", ln=True)
        
        pdf.set_fill_color(254, 242, 242)  # Red-50
        pdf.set_xy(10, pdf.get_y())
        pdf.multi_cell(0, 5, clean_pdf_text(report.first_aid_recommendations), align="L", fill=True)
        
        pdf.ln(4)
    
    # 5. Visualizations Section
    pdf.set_font("Helvetica", "B", 10.5)
    pdf.set_text_color(45, 55, 72)
    pdf.cell(0, 6, f"{'V' if report.first_aid_needed or report.is_emergency else 'IV'}. SCANS & GRAD-CAM VISUALIZATIONS", ln=True)
    pdf.ln(2)
    
    image_y = pdf.get_y()
    
    # Embed original scan (Left Column)
    if os.path.exists(report.image_path):
        pdf.image(report.image_path, x=15, y=image_y, w=76, h=76)
        pdf.set_xy(15, image_y + 77)
        pdf.set_font("Helvetica", "B", 8.5)
        pdf.set_text_color(100, 116, 139)
        pdf.cell(76, 5, "Figure A: Original CT/MRI Scan Input", ln=False, align="C")
        
    # Embed Grad-CAM Heatmap (Right Column)
    if os.path.exists(report.heatmap_path):
        pdf.image(report.heatmap_path, x=119, y=image_y, w=76, h=76)
        pdf.set_xy(119, image_y + 77)
        pdf.set_font("Helvetica", "B", 8.5)
        pdf.set_text_color(100, 116, 139)
        pdf.cell(76, 5, "Figure B: Hybrid Grad-CAM Localization Map", ln=True, align="C")
        
    pdf.ln(12)
    
    # Visual Notes explaining Grad-CAM maps
    pdf.set_font("Helvetica", "", 8.5)
    pdf.set_text_color(148, 163, 184) # Slate-400
    pdf.multi_cell(0, 4, "Visualization Guide: The Grad-CAM heatmap highlights active spatial regions driving the model prediction. Red/hot-colored focal spots indicate highly suspicious tissue density zones corresponding to hyperdense hematoma accumulations. Green/blue signals show low-probability texture contexts.", align="C")
    
    # Save the file
    pdf.output(output_path)
