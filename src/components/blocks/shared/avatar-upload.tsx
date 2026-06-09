import { useRef, useState } from 'react'
import { Camera } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'

type AvatarUploadProps = {
  initialSrc?: string
  name: string
  onChange?: (file: File | null) => void
}

function initials(name: string) {
  return name.replace(/[[\]]/g, '').slice(0, 2).toUpperCase()
}

export function AvatarUpload({ initialSrc, name, onChange }: AvatarUploadProps) {
  const [src, setSrc] = useState<string | undefined>(initialSrc)
  const ref = useRef<HTMLInputElement>(null)

  function pick(file: File) {
    const url = URL.createObjectURL(file)
    setSrc(url)
    onChange?.(file)
  }

  return (
    <div className="flex items-center gap-3">
      <div className="relative">
        <Avatar className="h-16 w-16">
          {src && <AvatarImage src={src} alt={name} />}
          <AvatarFallback>{initials(name)}</AvatarFallback>
        </Avatar>
        <Button
          type="button"
          variant="secondary"
          size="icon"
          className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full"
          onClick={() => ref.current?.click()}
          aria-label="Upload avatar"
        >
          <Camera className="h-3.5 w-3.5" />
        </Button>
        <input
          ref={ref}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) pick(f)
          }}
        />
      </div>
      <div className="text-xs text-muted-foreground">
        <div>Click the camera to upload.</div>
        <div>PNG or JPG up to 2MB.</div>
      </div>
    </div>
  )
}
