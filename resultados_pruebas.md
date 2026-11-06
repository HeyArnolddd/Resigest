# Resultados de las pruebas unitarias del backend — ResiGest

- **Fecha de ejecución:** 2026-11-06 14:35 (hora Colombia)
- **Rama / commit:** `frontend` / `d10b616`
- **Comando:** `mvnw.cmd test` (carpeta `Backend`)
- **Entorno:** Java 21.0.2 (Oracle, el proyecto compila con nivel Java 17) · Apache Maven 3.9.16 (wrapper) · JUnit Jupiter 6.0.3 (JUnit Platform 6.0.3) · Maven Surefire 3.5.6 · Spring Boot 4.1.1

### Salida final de Maven

```
[INFO] Results:
[INFO]
[INFO] Tests run: 49, Failures: 0, Errors: 0, Skipped: 0
[INFO]
[INFO] ------------------------------------------------------------------------
[INFO] BUILD SUCCESS
[INFO] ------------------------------------------------------------------------
[INFO] Total time:  29.076 s
[INFO] Finished at: 2026-11-06T14:35:12-05:00
[INFO] ------------------------------------------------------------------------
```

## Detalle por prueba

| # | Clase | Método | @DisplayName | Resultado | Tiempo (s) |
|---|---|---|---|---|---|
| 1 | BackendApplicationTests | `contextLoads` | — | OK | 0.420 |
| 2 | CifradorContrasenasTest | `cadaCifradoUsaUnIvDistinto` | — | OK | 0.115 |
| 3 | CifradorContrasenasTest | `conOtraClaveNoSePuedeDescifrar` | — | OK | 0.002 |
| 4 | CifradorContrasenasTest | `descifrarDevuelveElTextoOriginal` | — | OK | 0.001 |
| 5 | ObligacionFinancieraTest | `registrarAbonoRechazaMontoMayorAlSaldo` | — | OK | 0.008 |
| 6 | ObligacionFinancieraTest | `registrarAbonoSaldaYPasaAPagada` | — | OK | 0.005 |
| 7 | CarteraServiceImplTest | `generarSoloParaLosElegidosConSuValorPropio` | — | OK | 0.542 |
| 8 | CarteraServiceImplTest | `generarObligacionesCreaParaCadaApartamentoActivo` | — | OK | 0.009 |
| 9 | PagoServiceImplTest | `avisoSinConfiguracionNoConsultaNada` | — | OK | 0.370 |
| 10 | PagoServiceImplTest | `valorDistintoAlDeLaObligacionNoSeAprueba` | — | OK | 0.008 |
| 11 | PagoServiceImplTest | `pagoAprobadoPorPayuSeAceptaEnseguidaYUnaSolaVez` | — | OK | 0.007 |
| 12 | PagoServiceImplTest | `sinConfiguracionNoSePuedePagarEnLinea` | — | OK | 0.008 |
| 13 | PagoServiceImplTest | `pagoPendienteSigueIniciado` | — | OK | 0.007 |
| 14 | PagoServiceImplTest | `pagoRechazadoPorPayuQuedaRechazado` | — | OK | 0.005 |
| 15 | PagoServiceImplTest | `validarPagoApruebaPagoManualYAplicaAbono` | — | OK | 0.005 |
| 16 | PagoServiceImplTest | `firmaYValorComoLosDocumentaPayu` | — | OK | 0.018 |
| 17 | PagoServiceImplTest | `iniciarCreaElPagoSinDarloPorPagado` | — | OK | 0.012 |
| 18 | ProrrateoServiceImplTest | `previewRechazaCoeficientesQueNoSuman100` | — | OK | 0.104 |
| 19 | ProrrateoServiceImplTest | `previewCalculaValoresProporcionales` | — | OK | 0.006 |
| 20 | ApartamentoTest | `identificadorCompletoCombinaTorreYNumero` | — | OK | 0.002 |
| 21 | ApartamentoServiceImplTest | `crearLanzaConflictoCuandoYaExisteNumeroEnLaTorre` | — | OK | 0.099 |
| 22 | ApartamentoServiceImplTest | `crearGuardaApartamentoCuandoTorreExisteYNoHayDuplicado` | — | OK | 0.004 |
| 23 | ApartamentoControllerTest | `obtenerDevuelve200YNumero` | — | OK | 0.261 |
| 24 | IncidenciaTest | `resolverSinSolucionLanzaExcepcion` | — | OK | 0.001 |
| 25 | IncidenciaTest | `reabrirVuelveAEnProcesoConElComentario` | — | OK | 0.001 |
| 26 | IncidenciaTest | `noSePuedeConfirmarLoQueNoEstaResuelto` | — | OK | 0.004 |
| 27 | IncidenciaTest | `asignarAPasaAAAsignada` | — | OK | 0.001 |
| 28 | IncidenciaTest | `confirmarSolucionCierraLaIncidencia` | — | OK | 0.001 |
| 29 | IncidenciaTest | `resolverSinFotoLanzaExcepcion` | — | OK | 0.002 |
| 30 | PaqueteTest | `entregarDosVecesLanzaExcepcion` | — | OK | 0.001 |
| 31 | PaqueteTest | `entregarAPasaAEntregado` | — | OK | 0.001 |
| 32 | RegistroIngresoTest | `registrarSalidaPoneFecha` | — | OK | 0.002 |
| 33 | RegistroIngresoTest | `registrarSalidaDosVecesLanzaExcepcion` | — | OK | 0.002 |
| 34 | ReservaTest | `aprobarDosVecesLanzaExcepcion` | — | OK | 0.002 |
| 35 | ReservaTest | `noSeSolapaConRangoAnterior` | — | OK | 0.001 |
| 36 | ReservaTest | `aprobarPasaPendienteAAprobada` | — | OK | 0.001 |
| 37 | ReservaTest | `seSolapaConRangoQueSeCruza` | — | OK | 0.001 |
| 38 | ReservaServiceImplTest | `aprobarPasaReservaAAprobada` | — | OK | 0.226 |
| 39 | AuthServiceImplTest | `autenticarDevuelveTokenConCredencialesCorrectas` | — | OK | 0.345 |
| 40 | AuthServiceImplTest | `autenticarRegistraIntentoFallidoConCredencialesIncorrectas` | — | OK | 0.005 |
| 41 | UsuarioServiceImplTest | `credencialesDeUnAdministradorSeRechazan` | — | OK | 0.004 |
| 42 | UsuarioServiceImplTest | `eliminarUsuarioConHistorialLanzaConflicto` | — | OK | 0.004 |
| 43 | UsuarioServiceImplTest | `noSePuedeDesactivarNiEliminarLaPropiaCuenta` | — | OK | 0.004 |
| 44 | UsuarioServiceImplTest | `registrarConCorreoRepetidoLanzaConflicto` | — | OK | 0.004 |
| 45 | UsuarioServiceImplTest | `registrarPorteroGuardaCopiaCifradaYCorreoNormalizado` | — | OK | 0.009 |
| 46 | UsuarioServiceImplTest | `registrarDevuelveLosDatosDelRol` | — | OK | 0.004 |
| 47 | UsuarioServiceImplTest | `registrarAdministradorNoGuardaCopiaCifrada` | — | OK | 0.003 |
| 48 | UsuarioServiceImplTest | `credencialesDevuelveLaContrasenaDelPersonal` | — | OK | 0.003 |
| 49 | UsuarioServiceImplTest | `cambiarContrasenaActualizaHashYCopiaCifrada` | — | OK | 0.003 |

## Resumen por clase

| Clase | Pruebas | Fallas | Errores | Omitidas | Tiempo (s) |
|---|---|---|---|---|---|
| BackendApplicationTests | 1 | 0 | 0 | 0 | 20.416 |
| CifradorContrasenasTest | 3 | 0 | 0 | 0 | 0.122 |
| ObligacionFinancieraTest | 2 | 0 | 0 | 0 | 0.014 |
| CarteraServiceImplTest | 2 | 0 | 0 | 0 | 0.556 |
| PagoServiceImplTest | 9 | 0 | 0 | 0 | 0.450 |
| ProrrateoServiceImplTest | 2 | 0 | 0 | 0 | 0.116 |
| ApartamentoTest | 1 | 0 | 0 | 0 | 0.004 |
| ApartamentoServiceImplTest | 2 | 0 | 0 | 0 | 0.106 |
| ApartamentoControllerTest | 1 | 0 | 0 | 0 | 1.620 |
| IncidenciaTest | 6 | 0 | 0 | 0 | 0.015 |
| PaqueteTest | 2 | 0 | 0 | 0 | 0.006 |
| RegistroIngresoTest | 2 | 0 | 0 | 0 | 0.005 |
| ReservaTest | 4 | 0 | 0 | 0 | 0.010 |
| ReservaServiceImplTest | 1 | 0 | 0 | 0 | 0.228 |
| AuthServiceImplTest | 2 | 0 | 0 | 0 | 0.352 |
| UsuarioServiceImplTest | 9 | 0 | 0 | 0 | 0.046 |
| **Total** | **49** | **0** | **0** | **0** | **24.066** |

## Errores

Ninguna prueba falló.
