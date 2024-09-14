document.addEventListener('DOMContentLoaded', () => {
    const userTableBody = document.querySelector('#userTable tbody');
    const totalUsuarios = document.querySelector('#totalUsuarios');

    // Obtener y mostrar el número total de usuarios
    fetch('/api/usuarios/count')
        .then(response => response.json())
        .then(data => {
            totalUsuarios.textContent = data.total; // Actualiza el texto con el número total
        })
        .catch(error => console.error('Error obteniendo el total de usuarios:', error));

    // Obtener y mostrar usuarios
    fetch('/api/usuarios')
        .then(response => response.json())
        .then(users => {
            userTableBody.innerHTML = '';
            users.forEach(user => {
                const row = `
                    <tr>
                        <td>${user.id}</td>
                        <td>${user.usuario}</td>
                        <td>${user.correo}</td>
                        <td>
                            <button class="btn btn-warning btn-edit" data-id="${user.id}" data-usuario="${user.usuario}" data-correo="${user.correo}">Editar</button>
                            <button class="btn btn-danger btn-delete" data-id="${user.id}">Eliminar</button>
                        </td>
                    </tr>
                `;
                userTableBody.insertAdjacentHTML('beforeend', row);
            });
        })
        .catch(error => console.error('Error obteniendo usuarios:', error));

    // Añadir usuario
    document.querySelector('#createUserForm').addEventListener('submit', function (e) {
        e.preventDefault();
        const formData = new FormData(this);
        fetch('/api/usuarios', {
            method: 'POST',
            body: JSON.stringify(Object.fromEntries(formData)),
            headers: { 'Content-Type': 'application/json' }
        })
            .then(response => response.text())
            .then(message => {
                alert(message);
                location.reload();
            })
            .catch(error => console.error('Error añadiendo usuario:', error));
    });

    // Editar usuario
    userTableBody.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-edit')) {
            const id = e.target.dataset.id;
            const usuario = e.target.dataset.usuario;
            const correo = e.target.dataset.correo;

            // Llenar el modal de edición con los datos del usuario
            document.querySelector('#editUserId').value = id;
            document.querySelector('#editUsuario').value = usuario;
            document.querySelector('#editCorreo').value = correo;

            // Mostrar el modal
            const editModal = new bootstrap.Modal(document.querySelector('#editModal'));
            editModal.show();
        }

        if (e.target.classList.contains('btn-delete')) {
            const id = e.target.dataset.id;
            fetch(`/api/usuarios/${id}`, { method: 'DELETE' })
                .then(response => response.text())
                .then(message => {
                    alert(message);
                    location.reload();
                })
                .catch(error => console.error('Error eliminando usuario:', error));
        }
    });

    // Actualizar usuario
    document.querySelector('#editUserForm').addEventListener('submit', function (e) {
        e.preventDefault();
        const formData = new FormData(this);
        const data = Object.fromEntries(formData);
        // Enviar la contraseña solo si está presente
        if (!data.password) {
            delete data.password;
        }
        fetch(`/api/usuarios/${document.querySelector('#editUserId').value}`, {
            method: 'PUT',
            body: JSON.stringify(data),
            headers: { 'Content-Type': 'application/json' }
        })
            .then(response => response.text())
            .then(message => {
                alert(message);
                location.reload();
            })
            .catch(error => console.error('Error actualizando usuario:', error));
    });
});
