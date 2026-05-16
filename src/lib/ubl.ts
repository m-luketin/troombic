// Generate a believable UBL 2.1 + HR CIUS 2025 e-Račun XML from an invoice object.
// This is consumed inside the Likvidatura detail view (tab: UBL XML).
// The shape follows the actual Croatian e-Račun schema (HRInvoice.xsd at ubl.moj-eracun.hr),
// minus the XAdES signature (stubbed) and EU Trust List validation chain.

import type { Invoice } from "./invoice-helpers";

function esc(s: string): string {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function dec(n: number): string {
  return n.toFixed(2);
}

export function generateUbl(inv: Invoice, opts: { issuerOib?: string; issuerName?: string } = {}): string {
  const issuerOib = opts.issuerOib ?? "78755598868";
  const issuerName = opts.issuerName ?? "Grad Split";
  const lines = inv.linije ?? [
    { opis: inv.predmet, kolicina: 1, jedinica: "kom", cijena_jedinice: inv.iznos_neto },
  ];

  const linesXml = lines
    .map((l, i) => {
      const lineTotal = l.kolicina * l.cijena_jedinice;
      return `        <cac:InvoiceLine>
            <cbc:ID>${i + 1}</cbc:ID>
            <cbc:InvoicedQuantity unitCode="${esc(l.jedinica)}">${l.kolicina}</cbc:InvoicedQuantity>
            <cbc:LineExtensionAmount currencyID="EUR">${dec(lineTotal)}</cbc:LineExtensionAmount>
            <cac:Item>
                <cbc:Name>${esc(l.opis)}</cbc:Name>
                <cac:ClassifiedTaxCategory>
                    <cbc:ID>S</cbc:ID>
                    <cbc:Percent>${inv.pdv_stopa}</cbc:Percent>
                    <cac:TaxScheme>
                        <cbc:ID>VAT</cbc:ID>
                    </cac:TaxScheme>
                </cac:ClassifiedTaxCategory>
            </cac:Item>
            <cac:Price>
                <cbc:PriceAmount currencyID="EUR">${dec(l.cijena_jedinice)}</cbc:PriceAmount>
            </cac:Price>
        </cac:InvoiceLine>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2"
         xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
         xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2">

    <cbc:CustomizationID>urn:cen.eu:en16931:2017#compliant#urn:fina.hr:cius-2025</cbc:CustomizationID>
    <cbc:ProfileID>urn:fdc:peppol.eu:2017:poacc:billing:01:1.0</cbc:ProfileID>

    <cbc:ID>${esc(inv.id)}</cbc:ID>
    <cbc:IssueDate>${esc(inv.datum_izdavanja)}</cbc:IssueDate>
    <cbc:DueDate>${esc(inv.rok_placanja)}</cbc:DueDate>
    <cbc:InvoiceTypeCode>380</cbc:InvoiceTypeCode>
    <cbc:DocumentCurrencyCode>EUR</cbc:DocumentCurrencyCode>
    <cbc:BuyerReference>${esc(issuerName)}</cbc:BuyerReference>

    <!-- DOBAVLJAČ (Supplier) -->
    <cac:AccountingSupplierParty>
        <cac:Party>
            <cac:PartyName>
                <cbc:Name>${esc(inv.supplier.naziv)}</cbc:Name>
            </cac:PartyName>
            <cac:PostalAddress>
                <cbc:CityName>${esc(inv.supplier.mjesto)}</cbc:CityName>
                <cac:Country><cbc:IdentificationCode>HR</cbc:IdentificationCode></cac:Country>
            </cac:PostalAddress>
            <cac:PartyTaxScheme>
                <cbc:CompanyID>HR${esc(inv.supplier.oib)}</cbc:CompanyID>
                <cac:TaxScheme><cbc:ID>VAT</cbc:ID></cac:TaxScheme>
            </cac:PartyTaxScheme>
            <cac:PartyLegalEntity>
                <cbc:RegistrationName>${esc(inv.supplier.naziv)}</cbc:RegistrationName>
                <cbc:CompanyID schemeID="9934">${esc(inv.supplier.oib)}</cbc:CompanyID>
            </cac:PartyLegalEntity>
        </cac:Party>
    </cac:AccountingSupplierParty>

    <!-- KUPAC (Buyer — Grad Split) -->
    <cac:AccountingCustomerParty>
        <cac:Party>
            <cac:PartyName>
                <cbc:Name>${esc(issuerName)}</cbc:Name>
            </cac:PartyName>
            <cac:PostalAddress>
                <cbc:StreetName>Obala kneza Branimira 17</cbc:StreetName>
                <cbc:CityName>Split</cbc:CityName>
                <cbc:PostalZone>21000</cbc:PostalZone>
                <cac:Country><cbc:IdentificationCode>HR</cbc:IdentificationCode></cac:Country>
            </cac:PostalAddress>
            <cac:PartyTaxScheme>
                <cbc:CompanyID>HR${issuerOib}</cbc:CompanyID>
                <cac:TaxScheme><cbc:ID>VAT</cbc:ID></cac:TaxScheme>
            </cac:PartyTaxScheme>
            <cac:PartyLegalEntity>
                <cbc:RegistrationName>${esc(issuerName)}</cbc:RegistrationName>
                <cbc:CompanyID schemeID="9934">${issuerOib}</cbc:CompanyID>
            </cac:PartyLegalEntity>
        </cac:Party>
    </cac:AccountingCustomerParty>

    <cac:PaymentMeans>
        <cbc:PaymentMeansCode>58</cbc:PaymentMeansCode>
        <cbc:PaymentID>${esc(inv.id)}</cbc:PaymentID>
        <cac:PayeeFinancialAccount>
            <cbc:ID>${esc(inv.supplier.iban)}</cbc:ID>
        </cac:PayeeFinancialAccount>
    </cac:PaymentMeans>

    <cac:TaxTotal>
        <cbc:TaxAmount currencyID="EUR">${dec(inv.pdv_iznos)}</cbc:TaxAmount>
        <cac:TaxSubtotal>
            <cbc:TaxableAmount currencyID="EUR">${dec(inv.iznos_neto)}</cbc:TaxableAmount>
            <cbc:TaxAmount currencyID="EUR">${dec(inv.pdv_iznos)}</cbc:TaxAmount>
            <cac:TaxCategory>
                <cbc:ID>S</cbc:ID>
                <cbc:Percent>${inv.pdv_stopa}</cbc:Percent>
                <cac:TaxScheme>
                    <cbc:ID>VAT</cbc:ID>
                </cac:TaxScheme>
            </cac:TaxCategory>
        </cac:TaxSubtotal>
    </cac:TaxTotal>

    <cac:LegalMonetaryTotal>
        <cbc:LineExtensionAmount currencyID="EUR">${dec(inv.iznos_neto)}</cbc:LineExtensionAmount>
        <cbc:TaxExclusiveAmount currencyID="EUR">${dec(inv.iznos_neto)}</cbc:TaxExclusiveAmount>
        <cbc:TaxInclusiveAmount currencyID="EUR">${dec(inv.iznos_bruto)}</cbc:TaxInclusiveAmount>
        <cbc:PayableAmount currencyID="EUR">${dec(inv.iznos_bruto)}</cbc:PayableAmount>
    </cac:LegalMonetaryTotal>

${linesXml}

    <!-- XAdES-BES signature stub — in production: signed with FINA QSCD certificate -->
    <!-- <ds:Signature xmlns:ds="http://www.w3.org/2000/09/xmldsig#"> ... </ds:Signature> -->

</Invoice>`;
  return xml;
}
