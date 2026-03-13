document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('registrationForm');
    if (form) {
        const successAlert = document.getElementById('success-alert');

        const showError = (input, messageElementId, show) => {
            const messageElement = document.getElementById(messageElementId);
            if (show) {
                input.classList.add('error');
                if (messageElement) {
                    messageElement.style.display = 'block';
                }
            } else {
                input.classList.remove('error');
                if (messageElement) {
                    messageElement.style.display = 'none';
                }
            }
        };

        const validateText = (input, minLength) => {
            return input.value.trim().length >= minLength;
        };

        const validateSelect = (input) => {
            return input.value !== "";
        };

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            let isValid = true;

            const firstName = document.getElementById('firstName');
            if (!validateText(firstName, 2)) {
                showError(firstName, 'firstNameError', true);
                isValid = false;
            } else {
                showError(firstName, 'firstNameError', false);
            }

            const lastName = document.getElementById('lastName');
            if (!validateText(lastName, 2)) {
                showError(lastName, 'lastNameError', true);
                isValid = false;
            } else {
                showError(lastName, 'lastNameError', false);
            }

            const placeOfBirth = document.getElementById('placeOfBirth');
            if (!validateText(placeOfBirth, 2)) {
                showError(placeOfBirth, 'placeOfBirthError', true);
                isValid = false;
            } else {
                showError(placeOfBirth, 'placeOfBirthError', false);
            }

            const dateOfBirth = document.getElementById('dateOfBirth');
            const dobDate = new Date(dateOfBirth.value);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (!dateOfBirth.value || dobDate >= today) {
                showError(dateOfBirth, 'dateOfBirthError', true);
                isValid = false;
            } else {
                showError(dateOfBirth, 'dateOfBirthError', false);
            }

            const nationality = document.getElementById('nationality');
            if (!validateSelect(nationality)) {
                showError(nationality, 'nationalityError', true);
                isValid = false;
            } else {
                showError(nationality, 'nationalityError', false);
            }

            const maritalStatus = document.getElementById('maritalStatus');
            if (!validateSelect(maritalStatus)) {
                showError(maritalStatus, 'maritalStatusError', true);
                isValid = false;
            } else {
                showError(maritalStatus, 'maritalStatusError', false);
            }

            const settlementCamp = document.getElementById('settlementCamp');
            if (!validateSelect(settlementCamp)) {
                showError(settlementCamp, 'settlementCampError', true);
                isValid = false;
            } else {
                showError(settlementCamp, 'settlementCampError', false);
            }

            const dateOfJoining = document.getElementById('dateOfJoining');
            const joiningDate = new Date(dateOfJoining.value);

            if (!dateOfJoining.value || joiningDate <= today) {
                showError(dateOfJoining, 'dateOfJoiningError', true);
                isValid = false;
            } else {
                showError(dateOfJoining, 'dateOfJoiningError', false);
            }

            if (isValid) {
                const formData = {
                    firstName: firstName.value.trim(),
                    lastName: lastName.value.trim(),
                    placeOfBirth: placeOfBirth.value.trim(),
                    dateOfBirth: dateOfBirth.value,
                    gender: document.querySelector('input[name="gender"]:checked').value,
                    nationality: nationality.value,
                    maritalStatus: maritalStatus.value,
                    settlementCamp: settlementCamp.value,
                    dateOfJoining: dateOfJoining.value
                };

                try {
                    console.log('Sending form data:', formData);
                    const request = (window.apiClient && window.apiClient.request) ? window.apiClient.request : fetch;
                    const response = await request('/api/register', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(formData)
                    });

                    const result = await response.json();

                    if (response.ok) {
                        successAlert.style.display = 'block';
                        window.scrollTo(0, 0);
                        form.reset();
                        const inputs = form.querySelectorAll('.form-control');
                        inputs.forEach(input => input.classList.remove('error'));
                    } else {
                        const errorMessage = result.errors ? result.errors.join(', ') : (result.message || 'Submission failed');
                        alert('Error: ' + errorMessage);
                    }
                } catch (error) {
                    console.error('Error:', error);
                    alert('An error occurred. Please try again.');
                }
            }
        });

        window.closeAlert = () => {
            successAlert.style.display = 'none';
            form.reset();
        };
    }

    const adminTbody = document.getElementById('adminTbody');
    if (adminTbody) {
        const adminAlert = document.getElementById('admin-alert');
        const adminSearch = document.getElementById('adminSearch');
        const adminStatus = document.getElementById('adminStatus');
        const adminSort = document.getElementById('adminSort');
        const adminGender = document.getElementById('adminGender');
        const adminNationality = document.getElementById('adminNationality');
        const adminMaritalStatus = document.getElementById('adminMaritalStatus');
        const adminSettlementCamp = document.getElementById('adminSettlementCamp');
        const adminRegisteredFrom = document.getElementById('adminRegisteredFrom');
        const adminRegisteredTo = document.getElementById('adminRegisteredTo');
        const adminJoiningFrom = document.getElementById('adminJoiningFrom');
        const adminJoiningTo = document.getElementById('adminJoiningTo');
        const adminDobFrom = document.getElementById('adminDobFrom');
        const adminDobTo = document.getElementById('adminDobTo');
        const adminApply = document.getElementById('adminApply');
        const adminReset = document.getElementById('adminReset');
        const adminRefresh = document.getElementById('adminRefresh');
        const adminTotal = document.getElementById('adminTotal');
        const adminShowing = document.getElementById('adminShowing');
        const adminPageInfo = document.getElementById('adminPageInfo');
        const adminPrev = document.getElementById('adminPrev');
        const adminNext = document.getElementById('adminNext');
        const adminPageSize = document.getElementById('adminPageSize');
        const adminFilters = document.getElementById('adminFilters');
        const adminFiltersToggle = document.getElementById('adminFiltersToggle');
        const adminExportScope = document.getElementById('adminExportScope');
        const adminExportFormat = document.getElementById('adminExportFormat');
        const adminExportBtn = document.getElementById('adminExportBtn');

        const setAlert = (type, text) => {
            if (!adminAlert) return;
            adminAlert.className = `alert ${type === 'success' ? 'alert-success' : ''}`;
            adminAlert.textContent = text;
            adminAlert.style.display = 'block';
            window.scrollTo(0, 0);
            setTimeout(() => {
                adminAlert.style.display = 'none';
            }, 3000);
        };

        const formatDate = (value) => {
            if (!value) return '';
            const d = new Date(value);
            if (Number.isNaN(d.getTime())) return '';
            return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: '2-digit' });
        };

        const statusBadgeClass = (status) => {
            if (status === 'Approved') return 'admin-badge admin-badge--approved';
            if (status === 'Rejected') return 'admin-badge admin-badge--rejected';
            return 'admin-badge admin-badge--pending';
        };

        let searchTimer = null;
        let currentPage = 1;
        let currentTotal = 0;

        const renderRows = (items) => {
            adminTbody.innerHTML = '';

            if (!items || items.length === 0) {
                const tr = document.createElement('tr');
                const td = document.createElement('td');
                td.colSpan = 10;
                td.className = 'admin-empty';
                td.textContent = 'No applications found.';
                tr.appendChild(td);
                adminTbody.appendChild(tr);
                return;
            }

            items.forEach((item) => {
                const tr = document.createElement('tr');
                tr.dataset.id = item._id;

                const nameTd = document.createElement('td');
                nameTd.className = 'admin-name';
                nameTd.textContent = `${item.firstName || ''} ${item.lastName || ''}`.trim();

                const genderTd = document.createElement('td');
                genderTd.textContent = item.gender || '';

                const dobTd = document.createElement('td');
                dobTd.textContent = formatDate(item.dateOfBirth);

                const natTd = document.createElement('td');
                natTd.textContent = item.nationality || '';

                const maritalTd = document.createElement('td');
                maritalTd.textContent = item.maritalStatus || '';

                const campTd = document.createElement('td');
                campTd.textContent = item.settlementCamp || '';

                const joinTd = document.createElement('td');
                joinTd.textContent = formatDate(item.dateOfJoining);

                const regTd = document.createElement('td');
                regTd.textContent = formatDate(item.registrationDate || item.createdAt);

                const statusTd = document.createElement('td');
                const badge = document.createElement('span');
                badge.className = statusBadgeClass(item.status);
                badge.textContent = item.status || 'Pending';
                statusTd.appendChild(badge);

                const actionsTd = document.createElement('td');
                actionsTd.className = 'admin-actions';

                const approveBtn = document.createElement('button');
                approveBtn.type = 'button';
                approveBtn.className = 'admin-mini-btn admin-mini-btn--approve';
                approveBtn.dataset.action = 'approve';
                approveBtn.textContent = 'Approve';

                const rejectBtn = document.createElement('button');
                rejectBtn.type = 'button';
                rejectBtn.className = 'admin-mini-btn admin-mini-btn--reject';
                rejectBtn.dataset.action = 'reject';
                rejectBtn.textContent = 'Reject';

                const deleteBtn = document.createElement('button');
                deleteBtn.type = 'button';
                deleteBtn.className = 'admin-mini-btn admin-mini-btn--delete';
                deleteBtn.dataset.action = 'delete';
                deleteBtn.textContent = 'Delete';

                actionsTd.appendChild(approveBtn);
                actionsTd.appendChild(rejectBtn);
                actionsTd.appendChild(deleteBtn);

                tr.appendChild(nameTd);
                tr.appendChild(genderTd);
                tr.appendChild(dobTd);
                tr.appendChild(natTd);
                tr.appendChild(maritalTd);
                tr.appendChild(campTd);
                tr.appendChild(joinTd);
                tr.appendChild(regTd);
                tr.appendChild(statusTd);
                tr.appendChild(actionsTd);

                adminTbody.appendChild(tr);
            });
        };

        const getMultiValues = (select) => {
            if (!select) return [];
            return Array.from(select.options).filter((o) => o.selected).map((o) => o.value).filter(Boolean);
        };

        const getLimitValue = () => {
            const value = adminPageSize ? parseInt(adminPageSize.value, 10) : 50;
            if (!Number.isFinite(value) || value <= 0) return 50;
            return Math.min(value, 200);
        };

        const updatePagingUi = () => {
            const limit = getLimitValue();
            const totalPages = Math.max(Math.ceil((currentTotal || 0) / limit), 1);
            if (adminPageInfo) {
                adminPageInfo.textContent = `${currentPage}/${totalPages}`;
            }
            if (adminPrev) adminPrev.disabled = currentPage <= 1;
            if (adminNext) adminNext.disabled = currentPage >= totalPages;
        };

        const buildParams = () => {
            const params = new URLSearchParams();

            const statusValue = adminStatus ? adminStatus.value : '';
            const searchValue = adminSearch ? adminSearch.value.trim() : '';
            const sortValue = adminSort ? adminSort.value : '';
            const genderValue = adminGender ? adminGender.value : '';

            if (statusValue) params.set('status', statusValue);
            if (searchValue) params.set('q', searchValue);
            if (sortValue) params.set('sort', sortValue);
            if (genderValue) params.set('gender', genderValue);

            const nationalityValues = getMultiValues(adminNationality);
            if (nationalityValues.length > 0) params.set('nationality', nationalityValues.join(','));

            const maritalValues = getMultiValues(adminMaritalStatus);
            if (maritalValues.length > 0) params.set('maritalStatus', maritalValues.join(','));

            const campValues = getMultiValues(adminSettlementCamp);
            if (campValues.length > 0) params.set('settlementCamp', campValues.join(','));

            if (adminRegisteredFrom && adminRegisteredFrom.value) params.set('registeredFrom', adminRegisteredFrom.value);
            if (adminRegisteredTo && adminRegisteredTo.value) params.set('registeredTo', adminRegisteredTo.value);
            if (adminJoiningFrom && adminJoiningFrom.value) params.set('joiningFrom', adminJoiningFrom.value);
            if (adminJoiningTo && adminJoiningTo.value) params.set('joiningTo', adminJoiningTo.value);
            if (adminDobFrom && adminDobFrom.value) params.set('dobFrom', adminDobFrom.value);
            if (adminDobTo && adminDobTo.value) params.set('dobTo', adminDobTo.value);

            params.set('page', String(currentPage));
            params.set('limit', String(getLimitValue()));
            return params;
        };

        const buildExportParams = () => {
            const params = buildParams();

            const scope = adminExportScope ? adminExportScope.value : 'filtered';
            if (scope === 'filtered') {
                params.set('page', '1');
                params.set('limit', '10000');
            }

            return params;
        };

        const downloadExport = () => {
            const format = adminExportFormat ? adminExportFormat.value : 'csv';
            const params = buildExportParams();
            params.set('format', format);
            const urlBuilder = (window.apiClient && window.apiClient.url) ? window.apiClient.url : ((p) => p);
            window.location.href = urlBuilder(`/api/beneficiaries/export?${params.toString()}`);
        };

        const load = async () => {
            adminTbody.innerHTML = '<tr><td colspan="10" class="admin-empty">Loading...</td></tr>';

            try {
                const params = buildParams();
                const request = (window.apiClient && window.apiClient.request) ? window.apiClient.request : fetch;
                const response = await request(`/api/beneficiaries?${params.toString()}`);
                const result = await response.json();

                if (!response.ok) {
                    const message = result && result.message ? result.message : 'Failed to load applications';
                    setAlert('error', message);
                    renderRows([]);
                    return;
                }

                currentTotal = result.total || 0;
                if (adminTotal) adminTotal.textContent = String(currentTotal);
                if (adminShowing) adminShowing.textContent = String((result.items || []).length);
                renderRows(result.items || []);
                updatePagingUi();
            } catch (error) {
                console.error('Admin load error:', error);
                setAlert('error', 'Failed to load applications');
                renderRows([]);
            }
        };

        const updateStatus = async (id, status) => {
            try {
                const request = (window.apiClient && window.apiClient.request) ? window.apiClient.request : fetch;
                const response = await request(`/api/beneficiaries/${id}/status`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ status })
                });

                const result = await response.json();
                if (!response.ok) {
                    const message = result && result.message ? result.message : 'Failed to update status';
                    setAlert('error', message);
                    return;
                }

                setAlert('success', 'Status updated');
                await load();
            } catch (error) {
                console.error('Status update error:', error);
                setAlert('error', 'Failed to update status');
            }
        };

        const deleteBeneficiary = async (id) => {
            try {
                const request = (window.apiClient && window.apiClient.request) ? window.apiClient.request : fetch;
                const response = await request(`/api/beneficiaries/${id}`, { method: 'DELETE' });
                const result = await response.json();
                if (!response.ok) {
                    const message = result && result.message ? result.message : 'Failed to delete';
                    setAlert('error', message);
                    return;
                }
                setAlert('success', 'Deleted');
                await load();
            } catch (error) {
                console.error('Delete error:', error);
                setAlert('error', 'Failed to delete');
            }
        };

        adminTbody.addEventListener('click', async (e) => {
            const btn = e.target.closest('button');
            if (!btn) return;

            const action = btn.dataset.action;
            const tr = btn.closest('tr');
            const id = tr ? tr.dataset.id : null;
            if (!id) return;

            if (action === 'approve') {
                await updateStatus(id, 'Approved');
            } else if (action === 'reject') {
                await updateStatus(id, 'Rejected');
            } else if (action === 'delete') {
                const ok = window.confirm('Delete this application?');
                if (ok) await deleteBeneficiary(id);
            }
        });

        const applyAndLoad = async () => {
            currentPage = 1;
            await load();
        };

        if (adminRefresh) {
            adminRefresh.addEventListener('click', load);
        }

        if (adminApply) {
            adminApply.addEventListener('click', applyAndLoad);
        }

        if (adminReset) {
            adminReset.addEventListener('click', async () => {
                if (adminSearch) adminSearch.value = '';
                if (adminStatus) adminStatus.value = 'Pending';
                if (adminSort) adminSort.value = 'registrationDate:desc';
                if (adminGender) adminGender.value = '';
                if (adminRegisteredFrom) adminRegisteredFrom.value = '';
                if (adminRegisteredTo) adminRegisteredTo.value = '';
                if (adminJoiningFrom) adminJoiningFrom.value = '';
                if (adminJoiningTo) adminJoiningTo.value = '';
                if (adminDobFrom) adminDobFrom.value = '';
                if (adminDobTo) adminDobTo.value = '';
                if (adminNationality) Array.from(adminNationality.options).forEach((o) => { o.selected = false; });
                if (adminMaritalStatus) Array.from(adminMaritalStatus.options).forEach((o) => { o.selected = false; });
                if (adminSettlementCamp) Array.from(adminSettlementCamp.options).forEach((o) => { o.selected = false; });
                if (adminPageSize) adminPageSize.value = '50';
                currentPage = 1;
                await load();
            });
        }

        if (adminPrev) {
            adminPrev.addEventListener('click', async () => {
                currentPage = Math.max(currentPage - 1, 1);
                await load();
            });
        }

        if (adminNext) {
            adminNext.addEventListener('click', async () => {
                currentPage = currentPage + 1;
                await load();
            });
        }

        if (adminPageSize) {
            adminPageSize.addEventListener('change', applyAndLoad);
        }

        if (adminStatus) {
            adminStatus.addEventListener('change', applyAndLoad);
        }

        if (adminSort) {
            adminSort.addEventListener('change', applyAndLoad);
        }

        if (adminGender) {
            adminGender.addEventListener('change', applyAndLoad);
        }

        if (adminSearch) {
            adminSearch.addEventListener('input', () => {
                if (searchTimer) clearTimeout(searchTimer);
                searchTimer = setTimeout(applyAndLoad, 350);
            });
        }

        if (adminFiltersToggle && adminFilters) {
            const setFiltersOpen = (open) => {
                adminFilters.classList.toggle('admin-filters--open', open);
                adminFiltersToggle.textContent = open ? 'Hide Filters' : 'Filters';
            };

            adminFiltersToggle.addEventListener('click', () => {
                setFiltersOpen(!adminFilters.classList.contains('admin-filters--open'));
            });

            const isMobile = window.matchMedia && window.matchMedia('(max-width: 700px)').matches;
            setFiltersOpen(!isMobile);
        }

        if (adminExportBtn) {
            adminExportBtn.addEventListener('click', downloadExport);
        }

        load();
    }
});
