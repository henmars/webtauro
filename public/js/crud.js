document.addEventListener('DOMContentLoaded', () => {
    const userTableBody = document.querySelector('#userTable tbody');
    const rolesSelect = document.querySelector('#rol');
    const editRolesSelect = document.querySelector('#editRol');
    const totalUsuarios = document.querySelector('#totalUsuarios');
    const userPagination = document.querySelector('#user-pagination');
    const rolePagination = document.querySelector('#role-pagination');
    const limit = 5; // Número de elementos por página

    // Obtener y mostrar el número total de usuarios
    fetch('/api/usuarios/count')
        .then(response => response.json())
        .then(data => {
            totalUsuarios.textContent = data.total;
        })
        .catch(error => console.error('Error obteniendo el total de usuarios:', error));

    // Obtener y mostrar la primera página de usuarios con su rol
    fetch(`/api/usuarios/1`)
        .then(response => response.json())
        .then(data => {
            const users = data.users;
            userTableBody.innerHTML = '';
            users.forEach(user => {
                const row = `
                    <tr>
                        <td>${user.id}</td>
                        <td>${user.usuario}</td>
                        <td>${user.correo}</td>
                        <td>${user.nombre_rol || 'Sin Rol'}</td>
                        <td>
                            <button class="btn btn-warning btn-edit" data-id="${user.id}" data-usuario="${user.usuario}" data-correo="${user.correo}" data-rol-id="${user.id_rol}">Editar</button>
                            <button class="btn btn-danger btn-delete" data-id="${user.id}">Eliminar</button>
                        </td>
                    </tr>
                `;
                userTableBody.insertAdjacentHTML('beforeend', row);
            });

            // Actualiza la paginación de usuarios
            updatePagination(data.total, limit, 1);
        })
        .catch(error => console.error('Error obteniendo usuarios:', error));

    // Obtener y cargar los roles en el select de crear usuario y editar usuario
    fetch('/api/roles')
        .then(response => response.json())
        .then(roles => {
            roles.forEach(role => {
                const option = `<option value="${role.id}">${role.nombre_rol}</option>`;
                rolesSelect.insertAdjacentHTML('beforeend', option);
                editRolesSelect.insertAdjacentHTML('beforeend', option);
            });
        })
        .catch(error => console.error('Error obteniendo roles:', error));

    // Añadir un nuevo usuario
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

    // Obtener y mostrar la primera página de roles
    fetch(`/api/roles/1`)
        .then(response => response.json())
        .then(data => {
            const roles = data.roles;
            const rolesTableBody = document.querySelector('#rolesTable tbody');
            rolesTableBody.innerHTML = ''; // Limpiar el contenido previo
            roles.forEach(role => {
                const row = `
                    <tr>
                        <td>${role.id}</td>
                        <td>${role.nombre_rol}</td>
                        <td>
                            <button class="btn btn-danger btn-delete-role" data-id="${role.id}">Eliminar</button>
                        </td>
                    </tr>
                `;
                rolesTableBody.insertAdjacentHTML('beforeend', row);
            });

            // Actualizar la paginación de roles
            updateRolePagination(data.total, 1);
        })
        .catch(error => console.error('Error obteniendo roles:', error));

    // Editar un usuario
    userTableBody.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-edit')) {
            const id = e.target.getAttribute('data-id');
            const usuario = e.target.getAttribute('data-usuario');
            const correo = e.target.getAttribute('data-correo');
            const rolId = e.target.getAttribute('data-rol-id');

            document.querySelector('#editUserId').value = id;
            document.querySelector('#editUsuario').value = usuario;
            document.querySelector('#editCorreo').value = correo;
            document.querySelector('#editRol').value = rolId;

            const editModal = new bootstrap.Modal(document.querySelector('#editModal'));
            editModal.show();
        }

        if (e.target.classList.contains('btn-delete')) {
            const id = e.target.getAttribute('data-id');

            // Confirmar eliminación
            if (confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
                fetch(`/api/usuarios/${id}`, { method: 'DELETE' })
                    .then(response => response.text())
                    .then(message => {
                        alert(message);
                        location.reload();
                    })
                    .catch(error => console.error('Error eliminando usuario:', error));
            }
        }
    });

    // Actualizar un usuario
    document.querySelector('#editUserForm').addEventListener('submit', function (e) {
        e.preventDefault();
        const formData = new FormData(this);
        const userId = document.querySelector('#editUserId').value;
        fetch(`/api/usuarios/${userId}`, {
            method: 'PUT',
            body: JSON.stringify(Object.fromEntries(formData)),
            headers: { 'Content-Type': 'application/json' }
        })
            .then(response => response.text())
            .then(message => {
                alert(message);
                location.reload();
            })
            .catch(error => console.error('Error actualizando usuario:', error));
    });

    // Añadir rol
    document.querySelector('#addRoleForm').addEventListener('submit', function (e) {
        e.preventDefault();
        const formData = new FormData(this);
        fetch('/api/roles', {
            method: 'POST',
            body: JSON.stringify(Object.fromEntries(formData)),
            headers: { 'Content-Type': 'application/json' }
        })
            .then(response => response.text())
            .then(message => {
                alert(message);
                location.reload();
            })
            .catch(error => console.error('Error añadiendo rol:', error));
    });

    // Eliminar un rol
    document.querySelector('#rolesTable').addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-delete-role')) {
            const roleId = e.target.getAttribute('data-id');

            if (confirm('¿Estás seguro de que deseas eliminar este rol?')) {
                fetch(`/api/roles/${roleId}`, { method: 'DELETE' })
                    .then(response => response.text())
                    .then(message => {
                        alert(message);
                        location.reload(); // Recargar la página para actualizar la tabla de roles
                    })
                    .catch(error => console.error('Error eliminando rol:', error));
            }
        }
    });

    // Editar un rol
    document.querySelector('#rolesTable').addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-edit-role')) {
            const roleId = e.target.getAttribute('data-id');
            const roleName = e.target.getAttribute('data-nombre');

            // Mostrar modal para editar rol
            const roleModal = new bootstrap.Modal(document.querySelector('#addRoleModal'));
            roleModal.show();

            // Llenar el formulario del modal con los datos del rol
            document.querySelector('#addRoleForm').querySelector('#roleName').value = roleName;

            // Cambiar el comportamiento del formulario para editar en lugar de añadir
            const roleForm = document.querySelector('#addRoleForm');
            roleForm.removeEventListener('submit', addRoleFunction);  // Remover el evento previo de "añadir rol"

            roleForm.addEventListener('submit', function (e) {
                e.preventDefault();
                const newRoleName = document.querySelector('#roleName').value;

                fetch(`/api/roles/${roleId}`, {
                    method: 'PUT',
                    body: JSON.stringify({ nombre: newRoleName }),
                    headers: { 'Content-Type': 'application/json' }
                })
                    .then(response => response.text())
                    .then(message => {
                        alert(message);
                        location.reload();
                    })
                    .catch(error => console.error('Error actualizando rol:', error));
            });
        }
    });

    // Paginación de usuarios
    userPagination.addEventListener('click', (e) => {
        if (e.target.classList.contains('page-link')) {
            e.preventDefault();

            const pageNumber = e.target.textContent;
            fetch(`/api/usuarios/${pageNumber}`)
                .then(response => response.json())
                .then(data => {
                    const users = data.users;

                    // Actualiza la tabla de usuarios
                    userTableBody.innerHTML = '';
                    users.forEach(user => {
                        const row = `
                            <tr>
                                <td>${user.id}</td>
                                <td>${user.usuario}</td>
                                <td>${user.correo}</td>
                                <td>${user.nombre_rol || 'Sin Rol'}</td>
                                <td>
                                    <button class="btn btn-warning btn-edit" data-id="${user.id}" data-usuario="${user.usuario}" data-correo="${user.correo}" data-rol-id="${user.id_rol}">Editar</button>
                                    <button class="btn btn-danger btn-delete" data-id="${user.id}">Eliminar</button>
                                </td>
                            </tr>
                        `;
                        userTableBody.insertAdjacentHTML('beforeend', row);
                    });

                    // Actualiza la paginación de usuarios
                    updatePagination(data.total, limit, pageNumber);
                })
                .catch(error => console.error('Error obteniendo usuarios:', error));
        }
    });

    // Paginación de roles
    rolePagination.addEventListener('click', (e) => {
        if (e.target.classList.contains('page-link')) {
            e.preventDefault();

            const pageNumber = e.target.textContent;
            fetch(`/api/roles/${pageNumber}`)
                .then(response => response.json())
                .then(data => {
                    const roles = data.roles; // Accede a la lista de roles
                    const rolesTableBody = document.querySelector('#rolesTable tbody');
                    rolesTableBody.innerHTML = ''; // Limpiar el contenido previo

                    roles.forEach(role => {
                        const row = `
                            <tr>
                                <td>${role.id}</td>
                                <td>${role.nombre_rol}</td>
                                <td>
                                    <button class="btn btn-danger btn-delete-role" data-id="${role.id}">Eliminar</button>
                                </td>
                            </tr>
                        `;
                        rolesTableBody.insertAdjacentHTML('beforeend', row);
                    });

                    // Actualiza la paginación de roles
                    updateRolePagination(data.total, pageNumber);
                })
                .catch(error => console.error('Error obteniendo roles:', error));
        }
    });

    // Función para actualizar la paginación de roles
    function updateRolePagination(total, currentPage) {
        const totalPages = Math.ceil(total / limit);
        rolePagination.innerHTML = '';

        for (let i = 1; i <= totalPages; i++) {
            const activeClass = i == currentPage ? 'active' : '';
            const pageLink = `<li class="page-item ${activeClass}"><a class="page-link" href="#">${i}</a></li>`;
            rolePagination.insertAdjacentHTML('beforeend', pageLink);
        }
    }

    // Función para actualizar la paginación de usuarios
    function updatePagination(total, limit, currentPage) {
        const totalPages = Math.ceil(total / limit);
        userPagination.innerHTML = '';

        for (let i = 1; i <= totalPages; i++) {
            const activeClass = i == currentPage ? 'active' : '';
            const pageLink = `<li class="page-item ${activeClass}"><a class="page-link" href="#">${i}</a></li>`;
            userPagination.insertAdjacentHTML('beforeend', pageLink);
        }
    }
});
