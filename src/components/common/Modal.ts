import {Component} from "../base/Component";
import {ensureElement} from "../../utils/utils";
import {IEvents} from "../base/events";

interface IModalData {
    content: HTMLElement;
}

export class Modal extends Component<IModalData> {
    protected _closeButton: HTMLButtonElement;
    protected _content: HTMLElement;

    constructor(container: HTMLElement, protected events: IEvents) {
        super(container);

        this._closeButton = ensureElement<HTMLButtonElement>('.modal__close', container);
        this._content = ensureElement<HTMLElement>('.modal__content', container);

        // Клик по крестику или фону модалки → закрывает модалку.

        this._closeButton.addEventListener('click', this.close.bind(this));
        this.container.addEventListener('click', this.close.bind(this));
        this._content.addEventListener('click', (event) => event.stopPropagation());
    }

    set content(value: HTMLElement) {
        this._content.replaceChildren(value);
    }

    open() {
       this._toggleModal();// Показать модалку
        //  устанавливаемслушатель сохраняя контекст метода _handleEscape
        document.addEventListener('keydown',this._handleEscape.bind(this));
        this.events.emit('modal:open'); //  сообщаем что модальное окно открыто
    }

    close() {
        this._toggleModal(false);// скрываем модалку
        this.content = null; // очищаем данные старой формы
        // Это не про сборку мусора, а про чистоту интерфейса — чтобы модалка начинала с нуля при каждом открытии.M
        //  удаляемслушать сохрання контекст метода _handleEscape
        document.removeEventListener('keydown',this._handleEscape.bind(this));
        this.events.emit('modal:close'); // сообщаем что модальное окно закрыто
    }

    protected _toggleModal(state:boolean = true) {
        //  открываем или закрываем модалку в зависимости от переключателя state
        this.toggleClass(this.container, 'modal_active', state);
    }

    protected _handleEscape(event:KeyboardEvent){
            if(event.key ==='Escape'){
                this.close();
            }
    }   

    render(data: IModalData): HTMLElement {
        // принцип раделения ответственности???
        super.render(data); // вызываем метод рендера родительского класса
        this.open(); // открываем модалку
        return this.container; // возвращаем корневой элемент
    }


}