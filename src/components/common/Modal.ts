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
        this.toggleClass(this.container, 'modal_active', true);// Показать модалку
        this.events.emit('modal:open'); //  сообщаем что модальное окно открыто
    }

    close() {
        this.toggleClass(this.container, 'modal_active', false);// скрыввем модалку
        this.content = null; // очищаем данные старой формы
        // Это не про сборку мусора, а про чистоту интерфейса — чтобы модалка начинала с нуля при каждом открытии.M
        this.events.emit('modal:close'); // сообщаем что модальное окно закрыто
    }

    render(data: IModalData): HTMLElement {
        // принцип раделения ответственности???
        super.render(data); // вызываем метод рендера родительского класса
        this.open(); // открываем модалку
        return this.container; // возвращаем корневой элемент
    }
}