document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('registerForm');
    const usernameInput = document.getElementById('username');
    const nameInput = document.getElementById('name');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');

    // Función para mostrar errores
    const showError = (input, message) => {
        const errorElement = document.getElementById(`${input.id}Error`);
        errorElement.textContent = message;
        input.classList.add('error');
    };

    // Función para limpiar errores
    const clearError = (input) => {
        const errorElement = document.getElementById(`${input.id}Error`);
        errorElement.textContent = '';
        input.classList.remove('error');
    };

    // Validación en tiempo real
    const validateInput = (input) => {
        clearError(input);
        
        if (input.value.trim() === '') {
            showError(input, 'Este campo es requerido');
            return false;
        }

        if (input === usernameInput && input.value.length < 3) {
            showError(input, 'El nombre de usuario debe tener al menos 3 caracteres');
            return false;
        }

        if (input === passwordInput && input.value.length < 6) {
            showError(input, 'La contraseña debe tener al menos 6 caracteres');
            return false;
        }

        if (input === confirmPasswordInput && input.value !== passwordInput.value) {
            showError(input, 'Las contraseñas no coinciden');
            return false;
        }

        return true;
    };

    // Agregar eventos de validación en tiempo real
    [usernameInput, nameInput, passwordInput, confirmPasswordInput].forEach(input => {
        input.addEventListener('input', () => validateInput(input));
        input.addEventListener('blur', () => validateInput(input));
    });

    // Manejar el envío del formulario
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Validar todos los campos
        const isUsernameValid = validateInput(usernameInput);
        const isNameValid = validateInput(nameInput);
        const isPasswordValid = validateInput(passwordInput);
        const isConfirmPasswordValid = validateInput(confirmPasswordInput);

        if (!isUsernameValid || !isNameValid || !isPasswordValid || !isConfirmPasswordValid) {
            return;
        }

        try {
            const response = await fetch('/api/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: usernameInput.value.trim(),
                    name: nameInput.value.trim(),
                    password: passwordInput.value
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Error al registrar usuario');
            }

            // Redirigir al login en caso de éxito
            window.location.href = '/index.html';
        } catch (error) {
            showError(usernameInput, error.message);
        }
    });
}); 