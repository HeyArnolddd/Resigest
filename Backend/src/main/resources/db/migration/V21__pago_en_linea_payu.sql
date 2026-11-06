-- V21: el pago en línea pasa de Wompi a PayU. Los pagos de pasarela guardados quedan como PAYU.
UPDATE pago SET metodo = 'PAYU' WHERE metodo = 'WOMPI';
