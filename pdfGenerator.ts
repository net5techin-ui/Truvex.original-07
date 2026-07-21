import { jsPDF } from "jspdf";
import { CustomerDetails, VehicleDetails, CalculationResults } from "../types";

export function generateTruvexPDF(
  customer: CustomerDetails,
  vehicle: VehicleDetails,
  results: CalculationResults,
  imageSrc: string | null
) {
  // Create PDF in A4 size: 210mm x 297mm
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 15;
  const contentWidth = pageWidth - 2 * margin; // 180mm

  // Colors
  const darkNavy = [32, 54, 71];      // #203647
  const primaryBlue = [52, 91, 109];   // #345B6D
  const accentGold = [248, 180, 0];   // #F8B400
  const softSage = [175, 199, 189];   // #AFC7BD
  const textDark = [40, 50, 60];
  const textLight = [100, 110, 120];

  // ==========================================
  // WATERMARK
  // ==========================================
  pdf.saveGraphicsState();
  pdf.setTextColor(240, 244, 245); // Very faint gray-blue
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(55);
  // Center watermarks
  pdf.text("TRUVEX FINANCE", pageWidth / 2, 100, { align: "center", angle: 315 });
  pdf.text("CONFIDENTIAL", pageWidth / 2, 200, { align: "center", angle: 315 });
  pdf.restoreGraphicsState();

  // ==========================================
  // HEADER BANNER
  // ==========================================
  // Top Blue Banner Background
  pdf.setFillColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  pdf.rect(0, 0, pageWidth, 38, "F");

  // Golden Accent Line below Header
  pdf.setFillColor(accentGold[0], accentGold[1], accentGold[2]);
  pdf.rect(0, 38, pageWidth, 1.5, "F");

  // Left Side: Brand Name & Slogan
  pdf.setTextColor(255, 255, 255);
  pdf.setFont("times", "bold");
  pdf.setFontSize(26);
  pdf.text("T  R  U  V  E  X", margin, 18);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  pdf.setTextColor(softSage[0], softSage[1], softSage[2]);
  pdf.text("SMART VEHICLE VALUATION PLATFORM", margin, 24);
  pdf.text("PREMIER AUTO CREDIT ELIGIBILITY REPORT", margin, 29);

  // Right Side: Report Metadata Box in White Text
  pdf.setTextColor(255, 255, 255);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(9);
  pdf.text(`REPORT ID: ${customer.reportId}`, pageWidth - margin - 60, 15);
  pdf.text(`CUSTOMER ID: ${customer.customerId}`, pageWidth - margin - 60, 20);

  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(220, 220, 220);
  pdf.setFontSize(8);
  pdf.text(`DATE: ${customer.date}`, pageWidth - margin - 60, 26);
  pdf.text(`TIME: ${customer.time}`, pageWidth - margin - 60, 31);

  // ==========================================
  // SECTION: CLIENT & VALUATION METRICS
  // ==========================================
  let currentY = 48;

  // Header style for sections
  const drawSectionHeader = (title: string, yPos: number) => {
    pdf.setFillColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
    pdf.roundedRect(margin, yPos, contentWidth, 7, 1, 1, "F");
    
    // Tiny golden vertical accent
    pdf.setFillColor(accentGold[0], accentGold[1], accentGold[2]);
    pdf.rect(margin, yPos, 2.5, 7, "F");

    pdf.setTextColor(255, 255, 255);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(9.5);
    pdf.text(title.toUpperCase(), margin + 5, yPos + 4.8);
  };

  // 1. CUSTOMER & REPORT OVERVIEW
  drawSectionHeader("Customer & Applicant Details", currentY);
  currentY += 11;

  // Customer details table/grid
  pdf.setDrawColor(230, 235, 238);
  pdf.setLineWidth(0.2);
  pdf.roundedRect(margin, currentY - 2, contentWidth, 24, 2, 2, "S");

  // Grid vertical and horizontal divider lines
  pdf.line(margin + 90, currentY - 2, margin + 90, currentY + 22);
  pdf.line(margin, currentY + 10, margin + contentWidth, currentY + 10);

  // Row 1 Left: Customer Name
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(8.5);
  pdf.setTextColor(textLight[0], textLight[1], textLight[2]);
  pdf.text("Applicant Name:", margin + 4, currentY + 3);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(textDark[0], textDark[1], textDark[2]);
  pdf.setFontSize(9.5);
  pdf.text(customer.name || "N/A", margin + 4, currentY + 7.5);

  // Row 1 Right: Mobile
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(8.5);
  pdf.setTextColor(textLight[0], textLight[1], textLight[2]);
  pdf.text("Mobile Number:", margin + 94, currentY + 3);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(textDark[0], textDark[1], textDark[2]);
  pdf.setFontSize(9.5);
  pdf.text(customer.mobile || "N/A", margin + 94, currentY + 7.5);

  // Row 2 Left: Location
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(8.5);
  pdf.setTextColor(textLight[0], textLight[1], textLight[2]);
  pdf.text("Registered Location:", margin + 4, currentY + 14);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(textDark[0], textDark[1], textDark[2]);
  pdf.setFontSize(9);
  pdf.text(customer.location || "N/A", margin + 4, currentY + 18.5);

  // Row 2 Right: Address
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(8.5);
  pdf.setTextColor(textLight[0], textLight[1], textLight[2]);
  pdf.text("Residential Address:", margin + 94, currentY + 14);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(textDark[0], textDark[1], textDark[2]);
  pdf.setFontSize(8.5);
  // Truncate address if too long
  let addr = customer.address || "N/A";
  if (addr.length > 55) addr = addr.substring(0, 52) + "...";
  pdf.text(addr, margin + 94, currentY + 18.5);

  currentY += 28;

  // 2. VEHICLE ASSESSMENT DETAILS & IMAGE
  drawSectionHeader("Vehicle Assessment & Valuation Parameters", currentY);
  currentY += 11;

  // Split section into Left Column (Specs) and Right Column (Vehicle Photo)
  const leftColWidth = 100;
  const rightColWidth = 72;
  const colGap = 8;

  // Specs Table outline - expanded to fit all final output parameters beautifully
  const specsCount = 8;
  const rowH = 8.5;
  const specTableH = specsCount * rowH;

  pdf.setDrawColor(230, 235, 238);
  pdf.roundedRect(margin, currentY - 2, leftColWidth, specTableH, 2, 2, "S");

  // Specs Details
  const specs = [
    { label: "Vehicle Model", value: vehicle.bikeModel || "Used Bike" },
    { label: "Original Purchase Price", value: "Rs. " + Math.round(vehicle.originalPrice).toLocaleString("en-IN") },
    { label: "Years of Usage", value: `${results.vehicleAge} Years` },
    { label: "LTV Selected", value: `${vehicle.ltvLimit}% (Max allowed: 90%)` },
    { label: "Applied Interest Rate", value: `${vehicle.interestRate}% p.a.` },
    { label: "Loan Period", value: `${vehicle.loanTenure} Years (${results.loanMonths} Months)` },
    { label: "Total Interest Accrued", value: "Rs. " + Math.round(results.totalInterest || 0).toLocaleString("en-IN") },
    { label: "Credit Approval Status", value: results.approvalStatus || "Eligible" },
  ];

  specs.forEach((spec, idx) => {
    const yVal = currentY + (idx * rowH);
    if (idx > 0) {
      pdf.setDrawColor(240, 243, 245);
      pdf.line(margin, yVal - 2, margin + leftColWidth, yVal - 2);
    }
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(7.5);
    pdf.setTextColor(textLight[0], textLight[1], textLight[2]);
    pdf.text(spec.label, margin + 4, yVal + 3);

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(8);
    if (spec.label === "Credit Approval Status") {
      if (results.isEligible) {
        pdf.setTextColor(46, 125, 50); // green
      } else {
        pdf.setTextColor(198, 40, 40); // red
      }
    } else {
      pdf.setTextColor(textDark[0], textDark[1], textDark[2]);
    }
    pdf.text(String(spec.value), margin + leftColWidth - 4, yVal + 3, { align: "right" });
  });

  // Bike Image on the Right
  const imgX = margin + leftColWidth + colGap;
  const imgY = currentY - 2;
  const imgW = rightColWidth;
  const imgH = specTableH;

  pdf.setDrawColor(220, 225, 228);
  pdf.setFillColor(248, 250, 252);
  pdf.roundedRect(imgX, imgY, imgW, imgH, 2, 2, "FD");

  if (imageSrc) {
    try {
      // Draw image inside the frame nicely
      pdf.addImage(imageSrc, "JPEG", imgX + 2, imgY + 2, imgW - 4, imgH - 4);
    } catch (e) {
      // Error drawing image, draw fallback wireframe
      drawFallbackPhoto(pdf, imgX, imgY, imgW, imgH);
    }
  } else {
    drawFallbackPhoto(pdf, imgX, imgY, imgW, imgH);
  }

  currentY += specTableH + 4;

  // 3. FINANCIAL SUMMARY CARDS (HIGH IMPACT - GREEN, BLUE, GOLD)
  drawSectionHeader("Executive Finance Quote Summary", currentY);
  currentY += 11;

  const cardW = 56;
  const cardH = 24;
  const cardGap = 6;

  // Card 1: Estimated Market Value (Green/Sage theme)
  const card1X = margin;
  pdf.setFillColor(242, 248, 245); // Soft tint of green
  pdf.setDrawColor(175, 205, 185); // Green border
  pdf.roundedRect(card1X, currentY, cardW, cardH, 2, 2, "FD");
  // Accent strip
  pdf.setFillColor(46, 125, 50); // Darker Green
  pdf.rect(card1X, currentY, 1.5, cardH, "F");

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(7.5);
  pdf.setTextColor(46, 125, 50);
  pdf.text("CURRENT MARKET VALUE", card1X + 4, currentY + 6);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(13);
  pdf.setTextColor(30, 70, 40);
  pdf.text("Rs. " + Math.round(results.marketValue).toLocaleString("en-IN"), card1X + 4, currentY + 16);

  // Card 2: Eligible Loan Amount (Blue theme)
  const card2X = margin + cardW + cardGap;
  pdf.setFillColor(240, 244, 248); // Soft tint of blue
  pdf.setDrawColor(180, 200, 220); // Blue border
  pdf.roundedRect(card2X, currentY, cardW, cardH, 2, 2, "FD");
  // Accent strip
  pdf.setFillColor(33, 150, 243); // Premium Blue
  pdf.rect(card2X, currentY, 1.5, cardH, "F");

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(7.5);
  pdf.setTextColor(21, 101, 192);
  pdf.text("ELIGIBLE LOAN AMOUNT", card2X + 4, currentY + 6);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(13);
  pdf.setTextColor(15, 60, 120);
  pdf.text("Rs. " + Math.round(results.loanAmount).toLocaleString("en-IN"), card2X + 4, currentY + 16);

  // Card 3: Monthly EMI (Gold/Yellow theme)
  const card3X = margin + (cardW + cardGap) * 2;
  pdf.setFillColor(254, 249, 235); // Soft tint of gold
  pdf.setDrawColor(245, 215, 140); // Gold border
  pdf.roundedRect(card3X, currentY, cardW, cardH, 2, 2, "FD");
  // Accent strip
  pdf.setFillColor(accentGold[0], accentGold[1], accentGold[2]); // Accent Gold
  pdf.rect(card3X, currentY, 1.5, cardH, "F");

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(7.5);
  pdf.setTextColor(180, 120, 0);
  pdf.text("ESTIMATED MONTHLY EMI", card3X + 4, currentY + 6);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(13);
  pdf.setTextColor(120, 80, 0);
  pdf.text("Rs. " + Math.round(results.emi).toLocaleString("en-IN"), card3X + 4, currentY + 16);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(7);
  pdf.setTextColor(150, 110, 30);
  pdf.text("/ month", card3X + 4 + pdf.getTextWidth("Rs. " + Math.round(results.emi).toLocaleString("en-IN")) + 1.5, currentY + 15.5);

  currentY += cardH + 11;

  // ==========================================
  // DISCLAIMER BOX
  // ==========================================
  pdf.setDrawColor(softSage[0], softSage[1], softSage[2]);
  pdf.setFillColor(250, 252, 251);
  pdf.roundedRect(margin, currentY, contentWidth, 21, 2, 2, "FD");

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(8);
  pdf.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  pdf.text("OFFICIAL CREDIT DISCLAIMER & AUDIT CLAUSE:", margin + 5, currentY + 5);

  pdf.setFont("helvetica", "italic");
  pdf.setFontSize(7.5);
  pdf.setTextColor(110, 120, 125);
  pdf.text("• This automated valuation and eligibility report is generated dynamically by TRUVEX proprietary intelligence.", margin + 5, currentY + 10);
  pdf.text("• Actual credit approval and absolute loan-to-value percentage are subject to standard physical vehicle verification by the lender.", margin + 5, currentY + 14);
  pdf.text("• Calculated interest rates and final EMI scheduling quotes may vary in accordance with market volatility and credit policies.", margin + 5, currentY + 18);

  // ==========================================
  // FOOTER
  // ==========================================
  // Accent fine line at the bottom
  const footerY = pageHeight - 18;
  pdf.setDrawColor(230, 235, 238);
  pdf.setLineWidth(0.4);
  pdf.line(margin, footerY, pageWidth - margin, footerY);

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(8);
  pdf.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  pdf.text("TRUVEX CREDIT SYSTEM", margin, footerY + 5);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(7.5);
  pdf.setTextColor(textLight[0], textLight[1], textLight[2]);
  pdf.text("Smart Vehicle Loan Eligibility & Automated Asset Appraisal Portal.", margin, footerY + 9);

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(7.5);
  pdf.setTextColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
  pdf.text("CONFIDENTIAL REPORT", pageWidth - margin, footerY + 5, { align: "right" });

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(7.5);
  pdf.setTextColor(textLight[0], textLight[1], textLight[2]);
  pdf.text("Authorized Finance Partner Copy • Powered by TRUVEX Engine", pageWidth - margin, footerY + 9, { align: "right" });

  // Preview or save the PDF
  const blob = pdf.output("blob");
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank");
}

function drawFallbackPhoto(pdf: jsPDF, x: number, y: number, w: number, h: number) {
  // Draw premium wireframe illustration representing an asset upload placeholder
  pdf.setDrawColor(200, 210, 215);
  pdf.setLineWidth(0.3);
  
  // Outer dash pattern
  pdf.setLineDashPattern([2, 2], 0);
  pdf.roundedRect(x + 3, y + 3, w - 6, h - 6, 2, 2, "S");
  pdf.setLineDashPattern([], 0); // Reset dash

  // Camera icon or bike outline
  pdf.setFillColor(235, 240, 243);
  pdf.roundedRect(x + w / 2 - 12, y + h / 2 - 12, 24, 16, 1, 1, "F");
  pdf.setFillColor(180, 195, 200);
  pdf.circle(x + w / 2, y + h / 2 - 4, 5, "F");
  pdf.setFillColor(235, 240, 243);
  pdf.circle(x + w / 2, y + h / 2 - 4, 2, "F");
  pdf.setFillColor(180, 195, 200);
  pdf.rect(x + w / 2 - 6, y + h / 2 - 14, 12, 3, "F");

  // Bottom Label
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(7.5);
  pdf.setTextColor(140, 150, 155);
  pdf.text("VEHICLE IMAGE", x + w / 2, y + h - 14, { align: "center" });
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(6.5);
  pdf.text("Secured Asset Verification Photo", x + w / 2, y + h - 10, { align: "center" });
}

export function generateTruvexDemoManualPDF() {
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 15;
  const contentWidth = pageWidth - 2 * margin; // 180mm

  // Colors
  const headerBlue = [15, 60, 175]; // Royal Blue
  const textDark = [17, 24, 39]; // #111827
  const textMuted = [107, 114, 128]; // #6B7280
  const borderLight = [229, 231, 235]; // #E5E7EB
  const backgroundLight = [248, 250, 252]; // #F8FAFC

  // ==========================================
  // PAGE 1
  // ==========================================

  // 1. Header Banner
  pdf.setFillColor(headerBlue[0], headerBlue[1], headerBlue[2]);
  pdf.rect(0, 0, pageWidth, 38, "F");

  // Title on Left
  pdf.setTextColor(255, 255, 255);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(24);
  pdf.text("TRUVEX", margin, 17);

  // Subtitle on Left
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(9.5);
  pdf.setTextColor(220, 230, 255);
  pdf.text("SMART VEHICLE LOAN ESTIMATOR — USER GUIDE & MANUAL", margin, 26);

  // Rounded Pill Button on Right: "Official Demo Manual"
  pdf.setDrawColor(255, 255, 255);
  pdf.setLineWidth(0.4);
  pdf.roundedRect(143, 13, 52, 9, 4.5, 4.5, "D");

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(8.5);
  pdf.setTextColor(255, 255, 255);
  pdf.text("Official Demo Manual", 169, 18.5, { align: "center" });

  // 2. Welcome box
  pdf.setFillColor(backgroundLight[0], backgroundLight[1], backgroundLight[2]);
  pdf.rect(margin, 48, contentWidth, 23, "F");

  // Vertical Blue Bar on Left of welcome box
  pdf.setFillColor(37, 99, 235); // solid blue
  pdf.rect(margin, 48, 1.5, 23, "F");

  // Text inside welcome box
  pdf.setTextColor(75, 85, 99);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  const welcomeText = "Welcome to TRUVEX! This quick user guide explains how to navigate the Smart Vehicle Loan Estimator platform to generate real-time loan estimates, calculate credit metrics, and perform instant financial appraisals for Car and Bike loans.";
  const welcomeLines = pdf.splitTextToSize(welcomeText, contentWidth - 10);
  pdf.text(welcomeLines, margin + 5, 54);

  // 3. Section "1. OVERVIEW & KEY FEATURES"
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(11);
  pdf.setTextColor(textDark[0], textDark[1], textDark[2]);
  pdf.text("1. OVERVIEW & KEY FEATURES", margin, 82);

  // Divider
  pdf.setDrawColor(borderLight[0], borderLight[1], borderLight[2]);
  pdf.setLineWidth(0.35);
  pdf.line(margin, 85, pageWidth - margin, 85);

  // Card 1: Applicant & Loan Profiling
  pdf.setDrawColor(borderLight[0], borderLight[1], borderLight[2]);
  pdf.roundedRect(margin, 91, 87, 54, 3, 3, "D");

  // Emoji and Title for Card 1
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(10);
  pdf.setTextColor(29, 78, 216); // deep blue
  pdf.text("Applicant & Loan Profiling", margin + 5, 98);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8.5);
  pdf.setTextColor(55, 65, 81);
  
  const card1Bullets = [
    "• Auto-Generated ID: Unique Customer ID (e.g., TVX-20260720-413) tracks every appraisal session.",
    "• Dual Loan Modes: Toggle effortlessly between Car Loan and Bike Loan tabs.",
    "• Applicant Details: Mandatory fields ensure precise customer record linkage."
  ];

  let card1Y = 104;
  card1Bullets.forEach(b => {
    const lines = pdf.splitTextToSize(b, 77);
    pdf.text(lines, margin + 5, card1Y);
    card1Y += lines.length * 4.2 + 1.5;
  });

  // Card 2: Smart Calculation Engine
  pdf.roundedRect(108, 91, 87, 54, 3, 3, "D");

  // Title for Card 2
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(10);
  pdf.setTextColor(29, 78, 216);
  pdf.text("Smart Calculation Engine", 113, 98);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8.5);
  pdf.setTextColor(55, 65, 81);

  const card2Bullets = [
    "• Dynamic LTV Limits: Adjust Loan-to-Value ratios (80% to 90%) using presets or smooth sliders.",
    "• Depreciation Engine: Auto-calculates asset depreciation based on vehicle age and market rates.",
    "• Photo Appraisal: Drag & drop snapshot upload for visual validation."
  ];

  let card2Y = 104;
  card2Bullets.forEach(b => {
    const lines = pdf.splitTextToSize(b, 77);
    pdf.text(lines, 113, card2Y);
    card2Y += lines.length * 4.2 + 1.5;
  });

  // 4. Section "2. STEP-BY-STEP USAGE INSTRUCTIONS"
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(11);
  pdf.setTextColor(textDark[0], textDark[1], textDark[2]);
  pdf.text("2. STEP-BY-STEP USAGE INSTRUCTIONS", margin, 156);

  // Divider
  pdf.line(margin, 159, pageWidth - margin, 159);

  // Steps Table Header
  pdf.setFillColor(backgroundLight[0], backgroundLight[1], backgroundLight[2]);
  pdf.rect(margin, 164, contentWidth, 8, "F");

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(8.5);
  pdf.setTextColor(107, 114, 128);
  pdf.text("STEP", margin + 3, 169.5);
  pdf.text("SECTION", margin + 30, 169.5);
  pdf.text("ACTION REQUIRED", margin + 78, 169.5);

  // Divider under headers
  pdf.line(margin, 172, pageWidth - margin, 172);

  const stepsList = [
    { step: "Step 1", section: "Applicant Profile", action: "Verify Customer ID. Fill in Full Name, Contact Mobile, and Registered Location." },
    { step: "Step 2", section: "Vehicle Category", action: "Select either Car Loan or Bike Loan using the top toggle buttons." },
    { step: "Step 3", section: "Vehicle Specifications", action: "Select Brand, Model, Registration Year, Fuel Type, Transmission, Variant, KM Driven, and Owner Type." },
    { step: "Step 4", section: "Financial Parameters", action: "Input Original Price (Rs.), Current Market Value (Rs.), Interest Rate (% P.A.), and Loan Tenure. Select preferred LTV Limit %." },
    { step: "Step 5", section: "Vehicle Snapshot", action: "Upload a clean photo of the vehicle under Vehicle Photo Snapshot section." },
    { step: "Step 6", section: "Compute & Generate", action: "Click COMPUTE to run credit assessment, then click REPORT to download the appraisal document." },
  ];

  let rowY = 172;
  stepsList.forEach((st) => {
    // Step col
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(8.5);
    pdf.setTextColor(55, 65, 81);
    pdf.text(st.step, margin + 3, rowY + 6.5);

    // Section col
    pdf.setFont("helvetica", "normal");
    pdf.text(st.section, margin + 30, rowY + 6.5);

    // Action Required col
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(107, 114, 128);
    const actionLines = pdf.splitTextToSize(st.action, 98);
    pdf.text(actionLines, margin + 78, rowY + 6.5);

    rowY += 13.5;
    pdf.line(margin, rowY, pageWidth - margin, rowY);
  });

  // Page 1 Footer
  const footerY = 282;
  pdf.line(margin, footerY, pageWidth - margin, footerY);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(7.5);
  pdf.setTextColor(156, 163, 175);
  pdf.text("TRUVEX Smart Vehicle Loan Estimator — Conforms directly to ISO 27001 Secured Calculation Engine Guidelines.", margin, footerY + 5);
  pdf.text("Page 1 of 2", pageWidth - margin, footerY + 5, { align: "right" });

  // ==========================================
  // PAGE 2
  // ==========================================
  pdf.addPage();

  // 1. Section "3. CAR VS. BIKE LOAN INPUTS COMPARISON"
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(11);
  pdf.setTextColor(textDark[0], textDark[1], textDark[2]);
  pdf.text("3. CAR VS. BIKE LOAN INPUTS COMPARISON", margin, 20);

  // Divider
  pdf.line(margin, 23, pageWidth - margin, 23);

  // Comparison Table Header
  pdf.setFillColor(backgroundLight[0], backgroundLight[1], backgroundLight[2]);
  pdf.rect(margin, 28, contentWidth, 10, "F");

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(8.5);
  pdf.setTextColor(107, 114, 128);
  pdf.text("FIELD NAME", margin + 3, 34.5);
  pdf.text("CAR LOAN MODE", margin + 45, 34.5);
  pdf.text("BIKE LOAN MODE", margin + 115, 34.5);

  // Divider below header
  pdf.line(margin, 38, pageWidth - margin, 38);

  const compareRows = [
    { field: "Brand & Model", car: "Dropdown Selection (e.g. Maruti, Hyundai, Tata)", bike: "Direct Input / Selection (e.g. Royal Enfield Classic 350)" },
    { field: "Vehicle Age & Depreciation", car: "Derived from Registration Year & KM Driven", bike: "Explicit input for Vehicle Age (Years) & Depreciation (%)" },
    { field: "Standard Interest Rate", car: "Typically ~20.0% - 25.0% P.A. (e.g., Default 21.5%)", bike: "Typically ~20.0% - 25.0% P.A. (e.g., Default 22.0%)" },
    { field: "LTV Granularity", car: "Presets: 80%, 82%, 85%, 88%, 90%", bike: "1% Increments: 80% to 90%" }
  ];

  let compY = 38;
  compareRows.forEach(row => {
    // Field Name Col
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(8.5);
    pdf.setTextColor(55, 65, 81);
    pdf.text(row.field, margin + 3, compY + 6.5);

    // Car Loan Mode Col
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(107, 114, 128);
    const carLines = pdf.splitTextToSize(row.car, 65);
    pdf.text(carLines, margin + 45, compY + 6.5);

    // Bike Loan Mode Col
    const bikeLines = pdf.splitTextToSize(row.bike, 60);
    pdf.text(bikeLines, margin + 115, compY + 6.5);

    compY += 15.5;
    pdf.line(margin, compY, pageWidth - margin, compY);
  });

  // 2. Pro Tip Box
  const tipY = compY + 8;
  pdf.setFillColor(254, 243, 199); // #FEF3C7 light orange/yellow
  pdf.rect(margin, tipY, contentWidth, 16, "F");

  // Left Orange Bar
  pdf.setFillColor(245, 158, 11); // #F59E0B orange
  pdf.rect(margin, tipY, 1.5, 16, "F");

  // Text inside Pro Tip box
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(8.5);
  pdf.setTextColor(180, 83, 9); // amber-700
  pdf.text("Pro Tip:", margin + 5, tipY + 6.5);

  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(120, 53, 4); // amber-900
  const tipText = "Ensure that all required fields marked with an asterisk (*) are filled correctly before clicking COMPUTE to prevent calculation errors.";
  const tipLines = pdf.splitTextToSize(tipText, contentWidth - 25);
  pdf.text(tipLines, margin + 19, tipY + 6.5);

  // Page 2 Footer
  pdf.line(margin, footerY, pageWidth - margin, footerY);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(7.5);
  pdf.setTextColor(156, 163, 175);
  pdf.text("TRUVEX Smart Vehicle Loan Estimator — Conforms directly to ISO 27001 Secured Calculation Engine Guidelines.", margin, footerY + 5);
  pdf.text("Page 2 of 2", pageWidth - margin, footerY + 5, { align: "right" });

  // Save the PDF
  pdf.save("TRUVEX_User_Demo_Manual.pdf");
}

export function generateTruvexCarPDF(
  customer: CustomerDetails,
  vehicle: VehicleDetails,
  results: CalculationResults,
  imageSrc: string | null
) {
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 15;
  const contentWidth = pageWidth - 2 * margin; // 180mm

  // Colors
  const darkNavy = [32, 54, 71];      // #203647
  const primaryBlue = [52, 91, 109];   // #345B6D
  const accentGold = [248, 180, 0];   // #F8B400
  const softSage = [175, 199, 189];   // #AFC7BD
  const textDark = [40, 50, 60];
  const textLight = [100, 110, 120];

  // ==========================================
  // WATERMARK
  // ==========================================
  pdf.saveGraphicsState();
  pdf.setTextColor(240, 244, 245); // Very faint gray-blue
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(55);
  pdf.text("TRUVEX FINANCE", pageWidth / 2, 100, { align: "center", angle: 315 });
  pdf.text("CONFIDENTIAL", pageWidth / 2, 200, { align: "center", angle: 315 });
  pdf.restoreGraphicsState();

  // ==========================================
  // HEADER BANNER
  // ==========================================
  pdf.setFillColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  pdf.rect(0, 0, pageWidth, 38, "F");

  // Golden Accent Line below Header
  pdf.setFillColor(accentGold[0], accentGold[1], accentGold[2]);
  pdf.rect(0, 38, pageWidth, 1.5, "F");

  // Left Side: Brand Name & Slogan
  pdf.setTextColor(255, 255, 255);
  pdf.setFont("times", "bold");
  pdf.setFontSize(26);
  pdf.text("T  R  U  V  E  X", margin, 18);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  pdf.setTextColor(softSage[0], softSage[1], softSage[2]);
  pdf.text("SMART VEHICLE VALUATION PLATFORM", margin, 24);
  pdf.text("PREMIER AUTO CREDIT ELIGIBILITY REPORT", margin, 29);

  // Right Side: Report Metadata Box in White Text
  pdf.setTextColor(255, 255, 255);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(9);
  pdf.text(`REPORT ID: ${customer.reportId}`, pageWidth - margin - 60, 15);
  pdf.text(`CUSTOMER ID: ${customer.customerId}`, pageWidth - margin - 60, 20);

  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(220, 220, 220);
  pdf.setFontSize(8);
  pdf.text(`DATE: ${customer.date}`, pageWidth - margin - 60, 26);
  pdf.text(`TIME: ${customer.time}`, pageWidth - margin - 60, 31);

  let currentY = 48;

  // Header style for sections
  const drawSectionHeader = (title: string, yPos: number) => {
    pdf.setFillColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
    pdf.roundedRect(margin, yPos, contentWidth, 7, 1, 1, "F");
    
    // Tiny golden vertical accent
    pdf.setFillColor(accentGold[0], accentGold[1], accentGold[2]);
    pdf.rect(margin, yPos, 2.5, 7, "F");

    pdf.setTextColor(255, 255, 255);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(9.5);
    pdf.text(title.toUpperCase(), margin + 5, yPos + 4.8);
  };

  // 1. CUSTOMER & REPORT OVERVIEW
  drawSectionHeader("Customer & Applicant Details", currentY);
  currentY += 11;

  // Customer details table/grid
  pdf.setDrawColor(230, 235, 238);
  pdf.setLineWidth(0.2);
  pdf.roundedRect(margin, currentY - 2, contentWidth, 24, 2, 2, "S");

  // Grid vertical and horizontal divider lines
  pdf.line(margin + 90, currentY - 2, margin + 90, currentY + 22);
  pdf.line(margin, currentY + 10, margin + contentWidth, currentY + 10);

  // Row 1 Left: Customer Name
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(8.5);
  pdf.setTextColor(textLight[0], textLight[1], textLight[2]);
  pdf.text("Applicant Name:", margin + 4, currentY + 3);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(textDark[0], textDark[1], textDark[2]);
  pdf.setFontSize(9.5);
  pdf.text(customer.name || "N/A", margin + 4, currentY + 7.5);

  // Row 1 Right: Mobile
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(8.5);
  pdf.setTextColor(textLight[0], textLight[1], textLight[2]);
  pdf.text("Mobile Number:", margin + 94, currentY + 3);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(textDark[0], textDark[1], textDark[2]);
  pdf.setFontSize(9.5);
  pdf.text(customer.mobile || "N/A", margin + 94, currentY + 7.5);

  // Row 2 Left: Location
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(8.5);
  pdf.setTextColor(textLight[0], textLight[1], textLight[2]);
  pdf.text("Registered Location:", margin + 4, currentY + 14);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(textDark[0], textDark[1], textDark[2]);
  pdf.setFontSize(9);
  pdf.text(customer.location || "N/A", margin + 4, currentY + 18.5);

  // Row 2 Right: Address
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(8.5);
  pdf.setTextColor(textLight[0], textLight[1], textLight[2]);
  pdf.text("Residential Address:", margin + 94, currentY + 14);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(textDark[0], textDark[1], textDark[2]);
  pdf.setFontSize(8.5);
  let addr = customer.address || "N/A";
  if (addr.length > 55) addr = addr.substring(0, 52) + "...";
  pdf.text(addr, margin + 94, currentY + 18.5);

  currentY += 28;

  // 2. CAR ASSESSMENT DETAILS & IMAGE
  drawSectionHeader("Car Specifications & Valuation Parameters", currentY);
  currentY += 11;

  const leftColWidth = 100;
  const rightColWidth = 72;
  const colGap = 8;

  const specsCount = 10;
  const rowH = 8.0;
  const specTableH = specsCount * rowH;

  pdf.setDrawColor(230, 235, 238);
  pdf.roundedRect(margin, currentY - 2, leftColWidth, specTableH, 2, 2, "S");

  const specs = [
    { label: "Vehicle Type", value: "Car" },
    { label: "Brand & Model", value: `${vehicle.carBrand} ${vehicle.carModel}` },
    { label: "Mfg / Reg Year", value: `${vehicle.manufacturingYear} / ${vehicle.registrationYear}` },
    { label: "Fuel & Transmission", value: `${vehicle.fuelType} / ${vehicle.transmission}` },
    { label: "Variant / Trim", value: vehicle.variant || "Standard" },
    { label: "Kilometers Driven", value: (vehicle.kilometersDriven ?? 0).toLocaleString("en-IN") + " km" },
    { label: "Ownership Status", value: vehicle.ownerType || "First Owner" },
    { label: "Insurance Status", value: vehicle.insuranceStatus || "Valid" },
    { label: "Original Purchase Price", value: "Rs. " + Math.round(vehicle.originalPrice).toLocaleString("en-IN") },
    { label: "Credit Approval Status", value: results.approvalStatus || "Eligible" }
  ];

  specs.forEach((spec, idx) => {
    const yVal = currentY + (idx * rowH);
    if (idx > 0) {
      pdf.setDrawColor(240, 243, 245);
      pdf.line(margin, yVal - 2, margin + leftColWidth, yVal - 2);
    }
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(7.5);
    pdf.setTextColor(textLight[0], textLight[1], textLight[2]);
    pdf.text(spec.label, margin + 4, yVal + 3.2);

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(8);
    if (spec.label === "Credit Approval Status") {
      if (results.isEligible) {
        pdf.setTextColor(46, 125, 50); // green
      } else {
        pdf.setTextColor(198, 40, 40); // red
      }
    } else {
      pdf.setTextColor(textDark[0], textDark[1], textDark[2]);
    }
    pdf.text(String(spec.value), margin + leftColWidth - 4, yVal + 3.2, { align: "right" });
  });

  // Car Image on the Right
  const imgX = margin + leftColWidth + colGap;
  const imgY = currentY - 2;
  const imgW = rightColWidth;
  const imgH = specTableH;

  pdf.setDrawColor(220, 225, 228);
  pdf.setFillColor(248, 250, 252);
  pdf.roundedRect(imgX, imgY, imgW, imgH, 2, 2, "FD");

  if (imageSrc) {
    try {
      pdf.addImage(imageSrc, "JPEG", imgX + 2, imgY + 2, imgW - 4, imgH - 4);
    } catch (e) {
      drawFallbackPhoto(pdf, imgX, imgY, imgW, imgH);
    }
  } else {
    drawFallbackPhoto(pdf, imgX, imgY, imgW, imgH);
  }

  currentY += specTableH + 4;

  // 3. CAR ADJUSTMENTS breakdown section
  drawSectionHeader("Asset Valuation Depreciation & Adjustments Summary", currentY);
  currentY += 11;

  const adjCount = 4;
  const adjRowH = 7.0;
  const adjTableH = adjCount * adjRowH;

  pdf.setDrawColor(230, 235, 238);
  pdf.roundedRect(margin, currentY - 2, contentWidth, adjTableH, 2, 2, "S");

  const age = 2026 - (vehicle.manufacturingYear ?? 2026);
  const depPercent = results.depreciationPercent ?? 100;
  const kmPercent = results.kmAdjustmentPercent ?? 0;
  const ownerPercent = results.ownerAdjustmentPercent ?? 0;
  const insPercent = results.insuranceAdjustmentPercent ?? 0;

  const adjustmentsList = [
    { factor: `Base Depreciation (${age} Yr Usage Age)`, value: `${100 - depPercent}% Depreciation`, impact: `${depPercent}% remaining value` },
    { factor: `Kilometer Adjustment (${(vehicle.kilometersDriven ?? 0).toLocaleString()} km)`, value: `${kmPercent >= 0 ? "+" : ""}${kmPercent}%`, impact: kmPercent > 0 ? "Premium adjustment" : kmPercent < 0 ? "Overage deduction" : "Standard mileage" },
    { factor: `Ownership Status Adjustment (${vehicle.ownerType})`, value: `${ownerPercent >= 0 ? "+" : ""}${ownerPercent}%`, impact: ownerPercent < 0 ? "Owner multiplier penalty" : "No owner penalty" },
    { factor: `Insurance Status Adjustment (${vehicle.insuranceStatus})`, value: `${insPercent >= 0 ? "+" : ""}${insPercent}%`, impact: insPercent < 0 ? "Expired insurance deduction" : "No insurance penalty" }
  ];

  adjustmentsList.forEach((adj, idx) => {
    const yVal = currentY + (idx * adjRowH);
    if (idx > 0) {
      pdf.setDrawColor(240, 243, 245);
      pdf.line(margin, yVal - 2, margin + contentWidth, yVal - 2);
    }
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(7.5);
    pdf.setTextColor(textDark[0], textDark[1], textDark[2]);
    pdf.text(adj.factor, margin + 4, yVal + 2.8);

    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
    pdf.text(adj.value, margin + 110, yVal + 2.8);

    pdf.setFont("helvetica", "italic");
    pdf.setTextColor(textLight[0], textLight[1], textLight[2]);
    pdf.text(adj.impact, margin + contentWidth - 4, yVal + 2.8, { align: "right" });
  });

  currentY += adjTableH + 4;

  // 4. FINANCIAL SUMMARY CARDS
  drawSectionHeader("Executive Finance Quote Summary", currentY);
  currentY += 11;

  const cardW = 56;
  const cardH = 22;
  const cardGap = 6;

  // Card 1: Estimated Market Value
  const card1X = margin;
  pdf.setFillColor(242, 248, 245); // Soft tint of green
  pdf.setDrawColor(175, 205, 185); // Green border
  pdf.roundedRect(card1X, currentY, cardW, cardH, 2, 2, "FD");
  pdf.setFillColor(46, 125, 50); // Darker Green
  pdf.rect(card1X, currentY, 1.5, cardH, "F");

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(7.0);
  pdf.setTextColor(46, 125, 50);
  pdf.text("FINAL MARKET VALUE", card1X + 4, currentY + 5.5);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(11.5);
  pdf.setTextColor(30, 70, 40);
  pdf.text("Rs. " + Math.round(results.marketValue).toLocaleString("en-IN"), card1X + 4, currentY + 14.5);

  // Card 2: Eligible Loan Amount
  const card2X = margin + cardW + cardGap;
  pdf.setFillColor(240, 244, 248); // Soft tint of blue
  pdf.setDrawColor(180, 200, 220); // Blue border
  pdf.roundedRect(card2X, currentY, cardW, cardH, 2, 2, "FD");
  pdf.setFillColor(33, 150, 243); // Premium Blue
  pdf.rect(card2X, currentY, 1.5, cardH, "F");

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(7.0);
  pdf.setTextColor(21, 101, 192);
  pdf.text(`ELIGIBLE LOAN AMOUNT (${vehicle.ltvLimit}%)`, card2X + 4, currentY + 5.5);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(11.5);
  pdf.setTextColor(15, 60, 120);
  pdf.text("Rs. " + Math.round(results.loanAmount).toLocaleString("en-IN"), card2X + 4, currentY + 14.5);

  // Card 3: Monthly EMI
  const card3X = margin + (cardW + cardGap) * 2;
  pdf.setFillColor(254, 249, 235); // Soft tint of gold
  pdf.setDrawColor(245, 215, 140); // Gold border
  pdf.roundedRect(card3X, currentY, cardW, cardH, 2, 2, "FD");
  pdf.setFillColor(accentGold[0], accentGold[1], accentGold[2]); // Accent Gold
  pdf.rect(card3X, currentY, 1.5, cardH, "F");

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(7.0);
  pdf.setTextColor(180, 120, 0);
  pdf.text(`MONTHLY EMI (${vehicle.interestRate}%)`, card3X + 4, currentY + 5.5);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(11.5);
  pdf.setTextColor(120, 80, 0);
  pdf.text("Rs. " + Math.round(results.emi).toLocaleString("en-IN"), card3X + 4, currentY + 14.5);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(6.5);
  pdf.setTextColor(150, 110, 30);
  pdf.text("/ month", card3X + 4 + pdf.getTextWidth("Rs. " + Math.round(results.emi).toLocaleString("en-IN")) + 1.2, currentY + 14.0);

  currentY += cardH + 7;

  // Finance Company Quote Details Text
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(7.5);
  pdf.setTextColor(textLight[0], textLight[1], textLight[2]);
  pdf.text(`• Quote structured through Partner Financier: ${vehicle.financeCompany}. Tenure: ${vehicle.loanTenure} Years.`, margin + 2, currentY + 2);

  currentY += 6;

  // ==========================================
  // DISCLAIMER BOX
  // ==========================================
  pdf.setDrawColor(softSage[0], softSage[1], softSage[2]);
  pdf.setFillColor(250, 252, 251);
  pdf.roundedRect(margin, currentY, contentWidth, 19, 2, 2, "FD");

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(7.5);
  pdf.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  pdf.text("OFFICIAL CREDIT DISCLAIMER & AUDIT CLAUSE:", margin + 5, currentY + 4.5);

  pdf.setFont("helvetica", "italic");
  pdf.setFontSize(7.0);
  pdf.setTextColor(110, 120, 125);
  pdf.text("• This automated car valuation and credit assessment is generated by TRUVEX proprietary asset evaluation engine.", margin + 5, currentY + 9);
  pdf.text("• Calculated LTV limit, deprecations, kilometers penalties, and owner deductions are in accordance with lender risk policies.", margin + 5, currentY + 13);
  pdf.text("• Actual credit approval is subject to physical verification of chassis number, odometer, engine health and active insurance cover.", margin + 5, currentY + 17);

  // ==========================================
  // FOOTER
  // ==========================================
  const footerY = pageHeight - 16;
  pdf.setDrawColor(230, 235, 238);
  pdf.setLineWidth(0.4);
  pdf.line(margin, footerY, pageWidth - margin, footerY);

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(8);
  pdf.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  pdf.text("TRUVEX CREDIT SYSTEM", margin, footerY + 5);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(7.5);
  pdf.setTextColor(textLight[0], textLight[1], textLight[2]);
  pdf.text("Smart Vehicle Loan Processing & Automated Asset Appraisal Portal.", margin, footerY + 9);

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(7.5);
  pdf.setTextColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
  pdf.text("CONFIDENTIAL REPORT", pageWidth - margin, footerY + 5, { align: "right" });

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(7.5);
  pdf.setTextColor(textLight[0], textLight[1], textLight[2]);
  pdf.text("Authorized Car Finance Partner Copy • Powered by TRUVEX Engine", pageWidth - margin, footerY + 9, { align: "right" });

  // Preview or save the PDF
  const blob = pdf.output("blob");
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank");
}
