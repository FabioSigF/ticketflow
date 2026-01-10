import type {
  DraggableAttributes,
} from '@dnd-kit/core'
import { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities'
import { GripVertical } from 'lucide-react'

type DragHandleProps = {
  attributes: DraggableAttributes
  listeners?: SyntheticListenerMap
}

export function DragHandle({
  attributes,
  listeners,
}: DragHandleProps) {
  return (
    <span
      {...attributes}
      {...listeners}
      className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors"
    >
      <GripVertical size={16} />
    </span>
  )
}
