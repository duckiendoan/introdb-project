const ModalWindow = {
    init() {
        console.log("Init modal!");
        document.body.addEventListener("click", e => {
            if (e.target.classList.contains("modal__close")) {
                this.closeModal(e.target);
            }
        });
      
      // this.openModal();
    },

    getHtmlTemplate(modalOptions) {
        return `
        <div id="myModal" class="modal">
            <!-- Modal content -->
            <div class="modal-content">
                <div class="modal-header" style="background-color: ${modalOptions.color}">
                    <span class="close modal__close">&times;</span>
                    <h2>${modalOptions.title}</h2>
                </div>
                <div class="modal-body">
                    <p>${modalOptions.content}</p>
                </div>
            </div>
        
        </div>
        `;
    },

    openModal(modalOptions = {}) {
        modalOptions = Object.assign({
            title: 'Modal Title',
            content: 'Modal Content',
            footer: 'Modal Footer',
            color: 'var(--color-primary)'
        }, modalOptions);

        const modalTemplate = this.getHtmlTemplate(modalOptions);
        document.body.insertAdjacentHTML("afterbegin", modalTemplate);
    },

    alert(title, content) {
        this.openModal({
            'title': title,
            'content': content
        });
    },

    alertSuccess(title, content) {
        this.openModal({
            'title': title,
            'content': content,
            'color': 'var(--color-success)'
        });
    },

    alertError(title, content) {
        this.openModal({
            'title': title,
            'content': content,
            'color': 'var(--color-error)'
        });
    },

    closeModal(closeButton) {
        const modalOverlay = closeButton.parentElement.parentElement.parentElement;
        document.body.removeChild(modalOverlay);
    }
};

export {ModalWindow}