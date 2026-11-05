package co.edu.uis.resigest.comunicaciones.dto;

import co.edu.uis.resigest.comunicaciones.domain.Contacto;

public record ContactoDTO(Long id, String nombre, String detalle, String telefono, String categoria) {

    public static ContactoDTO de(Contacto c) {
        return new ContactoDTO(c.getId(), c.getNombre(), c.getDetalle(), c.getTelefono(), c.getCategoria());
    }
}
