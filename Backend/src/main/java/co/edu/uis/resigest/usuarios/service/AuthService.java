package co.edu.uis.resigest.usuarios.service;

import co.edu.uis.resigest.usuarios.dto.LoginRequest;
import co.edu.uis.resigest.usuarios.dto.TokenResponse;

/**
 * Contrato del caso de uso de autenticación.
 */
public interface AuthService {

    TokenResponse autenticar(LoginRequest request);
}
