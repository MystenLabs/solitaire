import {useDroppable} from "@dnd-kit/core";

export function EmptyDroppable(props: any) {
    const {setNodeRef} = useDroppable({
        id: props.id,
    });

    return (
        <div ref={setNodeRef} key={'empty-pile-droppable'}>
            {props.children}
        </div>
    );
}