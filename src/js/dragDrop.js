export class DragDrop {
    constructor() {
        this.draggedItem = null;
        this.touchTimeout = null;
        this.initialX = 0;
        this.initialY = 0;
    }

    init() {
        this.setupDragListeners();
        this.setupDropZoneListeners();
        this.setupTouchListeners();
    }

    setupDragListeners() {
        const items = document.querySelectorAll('.draggable-item');
        
        items.forEach(item => {
            item.addEventListener('dragstart', (e) => this.handleDragStart(e));
            item.addEventListener('dragend', (e) => this.handleDragEnd(e));
        });
    }

    setupDropZoneListeners() {
        const dropZones = document.querySelectorAll('.drop-zone');
        
        dropZones.forEach(zone => {
            zone.addEventListener('dragenter', (e) => this.handleDragEnter(e));
            zone.addEventListener('dragover', (e) => this.handleDragOver(e));
            zone.addEventListener('dragleave', (e) => this.handleDragLeave(e));
            zone.addEventListener('drop', (e) => this.handleDrop(e));
        });
    }

    setupTouchListeners() {
        const items = document.querySelectorAll('.draggable-item');
        
        items.forEach(item => {
            item.addEventListener('touchstart', (e) => this.handleTouchStart(e));
            item.addEventListener('touchmove', (e) => this.handleTouchMove(e));
            item.addEventListener('touchend', (e) => this.handleTouchEnd(e));
        });
    }

    handleDragStart(e) {
        this.draggedItem = e.target;
        e.target.classList.add('dragging');
        
        // Set drag image and data
        if (e.dataTransfer) {
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', '');
        }
    }

    handleDragEnd(e) {
        e.target.classList.remove('dragging');
        this.draggedItem = null;
        
        // Remove drag-over class from all drop zones
        document.querySelectorAll('.drop-zone').forEach(zone => {
            zone.classList.remove('drag-over');
        });
    }

    handleDragEnter(e) {
        e.preventDefault();
        if (e.target.classList.contains('drop-zone')) {
            e.target.classList.add('drag-over');
        }
    }

    handleDragOver(e) {
        e.preventDefault();
        if (e.target.classList.contains('drop-zone')) {
            e.dataTransfer.dropEffect = 'move';
        }
    }

    handleDragLeave(e) {
        if (e.target.classList.contains('drop-zone')) {
            e.target.classList.remove('drag-over');
        }
    }

    handleDrop(e) {
        e.preventDefault();
        const dropZone = e.target.closest('.drop-zone');
        
        if (dropZone && this.draggedItem) {

            // Clone and append the dragged item
            const clonedItem = this.draggedItem.cloneNode(true);
            dropZone.appendChild(clonedItem);
            
            // Remove the original item
            this.draggedItem.remove();
            
            // Remove the drag-over class
            dropZone.classList.remove('drag-over');
        }
    }

    handleTouchStart(e) {
        const touch = e.touches[0];
        this.initialX = touch.clientX;
        this.initialY = touch.clientY;
        this.draggedItem = e.target.closest('.draggable-item');
        
        this.touchTimeout = setTimeout(() => {
            if (this.draggedItem) {
                this.draggedItem.classList.add('dragging');
            }
        }, 200);
    }

    handleTouchMove(e) {
        if (!this.draggedItem) return;
        
        e.preventDefault();
        const touch = e.touches[0];
        
        this.draggedItem.style.position = 'fixed';
        this.draggedItem.style.left = `${touch.clientX - 50}px`;
        this.draggedItem.style.top = `${touch.clientY - 25}px`;
        
        // Find drop zone under touch point
        const dropZone = document.elementFromPoint(touch.clientX, touch.clientY);
        if (dropZone && dropZone.classList.contains('drop-zone')) {
            dropZone.classList.add('drag-over');
        }
    }

    handleTouchEnd(e) {
        if (!this.draggedItem) return;
        
        clearTimeout(this.touchTimeout);
        
        const touch = e.changedTouches[0];
        const dropZone = document.elementFromPoint(touch.clientX, touch.clientY);
        
        if (dropZone && dropZone.classList.contains('drop-zone')) {
            const clonedItem = this.draggedItem.cloneNode(true);
            clonedItem.style.position = '';
            clonedItem.style.left = '';
            clonedItem.style.top = '';
            
            // Clear existing items in the drop zone
            const existingItems = dropZone.querySelectorAll('.draggable-item');
            existingItems.forEach(item => item.remove());
            
            dropZone.appendChild(clonedItem);
            this.draggedItem.remove();
        } else {
            this.draggedItem.style.position = '';
            this.draggedItem.style.left = '';
            this.draggedItem.style.top = '';
        }
        
        this.draggedItem.classList.remove('dragging');
        this.draggedItem = null;
        
        document.querySelectorAll('.drop-zone').forEach(zone => {
            zone.classList.remove('drag-over');
        });
    }
}
