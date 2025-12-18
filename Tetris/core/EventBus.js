class EventBus{ //イベント管理
    constructor(){
        this.handlers = {}; //イベント名
    }

    on(type, handler){ //イベントを購読
        (this.handlers[type] ??= []).push(handler);
    }

    off(type, handler){ //イベントの削除
        this.handlers[type] = (this.handlers[type] ?? []).filter(h => h !== handler);
    }

    emit(type, payload){ //イベントを通知
        (this.handlers[type] ?? []).forEach(h => h(payload));
    }
}

const eventBus = new EventBus();