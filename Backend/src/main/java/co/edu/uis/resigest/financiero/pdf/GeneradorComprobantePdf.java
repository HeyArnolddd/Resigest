package co.edu.uis.resigest.financiero.pdf;

import co.edu.uis.resigest.common.exception.ReglaNegocioException;
import co.edu.uis.resigest.financiero.domain.Pago;
import com.lowagie.text.Document;
import com.lowagie.text.Paragraph;
import com.lowagie.text.pdf.PdfWriter;
import org.springframework.stereotype.Component;

import java.io.ByteArrayOutputStream;

/**
 * Genera el comprobante en PDF con openpdf.
 */
@Component
public class GeneradorComprobantePdf implements GeneradorComprobante {

    @Override
    public byte[] generar(Pago pago) {
        try {
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            Document document = new Document();
            PdfWriter.getInstance(document, out);
            document.open();
            document.add(new Paragraph("ResiGest - Comprobante de pago"));
            document.add(new Paragraph("Monto: " + pago.getMonto()));
            document.add(new Paragraph("Método: " + pago.getMetodo()));
            document.add(new Paragraph("Fecha: " + pago.getFecha()));
            document.add(new Paragraph("Obligación: " + pago.getObligacion().getId()));
            document.close();
            return out.toByteArray();
        } catch (Exception e) {
            throw new ReglaNegocioException("No se pudo generar el comprobante");
        }
    }
}
