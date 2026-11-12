/**
 * ========================================================================
 * TERRANOVA DESARROLLOS INMOBILIARIOS
 * ARCHIVO: js/form-validation.js
 * PROPÓSITO: Validación en tiempo real de prospectos (+57) y sanitización
 * DIRECTIVAS: D3 (<0.4s), D4 (Ergonomía móvil iOS/Android), D6 (<1.000 líneas)
 * ========================================================================
 */

(function (global) {
  'use strict';

  const COLOMBIA_PHONE_REGEX = /^3[0-9]{9}$/;
  const NAME_MIN_LENGTH = 3;

  /**
   * 1. SANITIZACIÓN DE TELÉFONO COLOMBIANO
   * Limpia caracteres no numéricos y remueve prefijo '57' si el usuario pega el número completo.
   */
  function sanitizeColombianPhone(rawValue) {
    let digits = String(rawValue || '').replace(/\D/g, '');
    if (digits.length === 12 && digits.startsWith('57')) {
      digits = digits.slice(2);
    }
    return digits.slice(0, 10);
  }

  /**
   * 2. VALIDACIÓN INDIVIDUAL DE CAMPOS
   */
  function validateNameField(inputEl, errorEl) {
    if (!inputEl) return false;
    const value = inputEl.value.trim();

    if (value.length < NAME_MIN_LENGTH) {
      setFieldState(inputEl, errorEl, false, 'Ingrese su nombre completo (mínimo 3 caracteres).');
      return false;
    }

    if (/[0-9]/.test(value)) {
      setFieldState(inputEl, errorEl, false, 'El nombre no debe contener números.');
      return false;
    }

    setFieldState(inputEl, errorEl, true, '');
    return true;
  }

  function validatePhoneField(inputEl, errorEl) {
    if (!inputEl) return false;
    const cleaned = sanitizeColombianPhone(inputEl.value);
    inputEl.value = cleaned;

    if (!COLOMBIA_PHONE_REGEX.test(cleaned)) {
      setFieldState(inputEl, errorEl, false, 'Ingrese un celular válido de 10 dígitos iniciado en 3.');
      return false;
    }

    setFieldState(inputEl, errorEl, true, '');
    return true;
  }

  /**
   * 3. ACTUALIZACIÓN VISUAL DEL ESTADO DEL CAMPO
   */
  function setFieldState(inputEl, errorEl, isValid, message) {
    inputEl.classList.remove('is-valid', 'is-invalid');
    inputEl.classList.add(isValid ? 'is-valid' : 'is-invalid');
    inputEl.setAttribute('aria-invalid', isValid ? 'false' : 'true');

    if (errorEl) {
      errorEl.textContent = message || '';
      errorEl.classList.toggle('is-error', !isValid && Boolean(message));
    }
  }

  /**
   * 4. VALIDACIÓN COMPLETA DEL FORMULARIO Y EXTRACCIÓN DE DATOS
   */
  function validateLeadForm() {
    const nameInput = document.getElementById('leadName');
    const phoneInput = document.getElementById('leadPhone');
    const projectSelect = document.getElementById('leadProject');
    const nameError = document.getElementById('leadNameError');
    const phoneError = document.getElementById('leadPhoneError');

    const isNameOk = validateNameField(nameInput, nameError);
    const isPhoneOk = validatePhoneField(phoneInput, phoneError);

    if (!isNameOk && nameInput) {
      nameInput.focus();
      return { valid: false, data: null };
    }

    if (!isPhoneOk && phoneInput) {
      phoneInput.focus();
      return { valid: false, data: null };
    }

    return {
      valid: true,
      data: {
        nombre: nameInput ? nameInput.value.trim() : '',
        telefono: phoneInput ? phoneInput.value.trim() : '',
        proyecto: projectSelect ? projectSelect.value : 'General',
        timestamp: new Date().toISOString()
      }
    };
  }

  /**
   * 5. VINCULACIÓN DE EVENTOS EN TIEMPO REAL
   */
  function initFormValidation() {
    const form = document.getElementById('mainLeadForm');
    if (!form) return; // En páginas sin formulario (ej. index.html) termina sin errores

    const nameInput = document.getElementById('leadName');
    const phoneInput = document.getElementById('leadPhone');
    const nameError = document.getElementById('leadNameError');
    const phoneError = document.getElementById('leadPhoneError');

    if (nameInput) {
      nameInput.addEventListener('blur', () => validateNameField(nameInput, nameError));
      nameInput.addEventListener('input', () => {
        if (nameInput.classList.contains('is-invalid')) {
          validateNameField(nameInput, nameError);
        }
      });
    }

    if (phoneInput) {
      phoneInput.addEventListener('input', () => {
        phoneInput.value = sanitizeColombianPhone(phoneInput.value);
        if (phoneInput.classList.contains('is-invalid') || phoneInput.value.length === 10) {
          validatePhoneField(phoneInput, phoneError);
        }
      });
      phoneInput.addEventListener('blur', () => validatePhoneField(phoneInput, phoneError));
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFormValidation);
  } else {
    initFormValidation();
  }

  global.TERRANOVA_VALIDATOR = {
    validate: validateLeadForm,
    sanitizePhone: sanitizeColombianPhone
  };

})(typeof window !== 'undefined' ? window : this);