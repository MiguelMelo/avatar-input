"use client";
import {
  ChangeEvent,
  InputHTMLAttributes,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import ReactCrop, {
  Crop,
  PixelCrop,
  centerCrop,
  convertToPixelCrop,
  makeAspectCrop,
} from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

import { Avatar, AvatarFallback, AvatarImage } from "./avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./dialog";
import { Button } from "./button";
import { toBase64 } from "@/lib/utils";
import { canvasPreview } from "./canvasPreview";

function centerAspectCrop(
  mediaWidth: number,
  mediaHeight: number,
  aspect: number
) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: "%",
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight
    ),
    mediaWidth,
    mediaHeight
  );
}

const ASPECT = 4 / 4;

type TAvatarInput = InputHTMLAttributes<HTMLInputElement> & {
  onChange?(...args: any[]): void;
};

export function AvatarInput(avatarInputProps: TAvatarInput) {
  const [open, setOpen] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const imgRef = useRef<HTMLImageElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [outputCroppedImg, setOutputCroppedImg] = useState<string>(
    avatarInputProps.value?.toString() ?? ""
  );

  function onSelectFile(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) {
      setCrop(undefined); // Makes crop preview update between images.
      const reader = new FileReader();
      reader.addEventListener("load", () =>
        setImage(reader.result?.toString() || "")
      );
      reader.readAsDataURL(e.target.files[0]);
    }
  }

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const { width, height } = e.currentTarget;
    setCrop(centerAspectCrop(width, height, ASPECT));
  }

  const onChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setOpen(true);
    onSelectFile(e);
  }, []);

  const onOpenChange = useCallback((state: boolean) => {
    setOpen(state);
    if (!!fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  function onSave() {
    if (!previewCanvasRef.current) {
      throw new Error("Crop canvas does not exist");
    }

    previewCanvasRef.current.toBlob((blob) => {
      if (!blob) {
        throw new Error("Failed to create blob");
      }
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        setOutputCroppedImg(reader.result?.toString() || "");
        if (!!avatarInputProps.onChange) {
          avatarInputProps.onChange(reader.result?.toString() || "");
        }
        onOpenChange(false);
      });
      reader.readAsDataURL(blob);
    });
  }

  useEffect(() => {
    const t = setTimeout(() => {
      if (
        completedCrop?.width &&
        completedCrop?.height &&
        imgRef.current &&
        previewCanvasRef.current
      ) {
        // We use canvasPreview as it's much faster than imgPreview.
        canvasPreview(imgRef.current, previewCanvasRef.current, completedCrop);
      }
    }, 500);

    return () => clearTimeout(t);
  }, [completedCrop]);

  return (
    <>
      <label className="cursor-pointer" htmlFor={avatarInputProps.id}>
        <Avatar className="w-16 h-16 text-zinc-400">
          <input
            {...avatarInputProps}
            id={avatarInputProps.id}
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onChange}
            value={undefined}
          />
          <AvatarImage src={outputCroppedImg} alt="avatar" />
          <AvatarFallback className="bg-zinc-600">AV</AvatarFallback>
        </Avatar>
      </label>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="flex flex-col w-96">
          <DialogHeader>
            <DialogTitle>Avatar</DialogTitle>
          </DialogHeader>
          <div className="flex w-full">
            <ReactCrop
              className="w-full h-full"
              crop={crop}
              onChange={(_, percentCrop) => setCrop(percentCrop)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={ASPECT}
              minWidth={250}
              minHeight={250}
            >
              {image && (
                <img
                  ref={imgRef}
                  className="w-full object-contain rounded"
                  src={image}
                  onLoad={onImageLoad}
                  alt="Crop me"
                />
              )}
            </ReactCrop>
          </div>
          {!!completedCrop && (
            <canvas className="hidden" ref={previewCanvasRef} />
          )}
          <DialogFooter>
            <Button variant="outline" onClick={onSave}>
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
