// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0
import {useDroppable} from "@dnd-kit/core";

export function EmptyDroppable(props: any) {
    const {setNodeRef} = useDroppable({
        id: props.id,
    });

    return (
        <div ref={setNodeRef} key={'empty-pile-droppable'} className={"h-[110px] md:h-[166px] w-[80px] md:w-[120px]"}>
            {props.children}
        </div>
    );
}