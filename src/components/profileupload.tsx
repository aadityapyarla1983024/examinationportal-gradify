import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type RefObject,
} from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ImageCrop,
  ImageCropApply,
  ImageCropContent,
  ImageCropReset,
} from "@/components/ui/shadcn-io/image-crop";

interface ProfileImageProps {
  profilePic: RefObject<File | null>; // Change from string to File
  initialPicUrl?: string | null;
}

const ProfileImage: React.FC<ProfileImageProps> = ({
  profilePic,
  initialPicUrl,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (profilePic && selectedFile && croppedImage) {
      const base64ToFile = (base64: string, filename: string): File => {
        const arr = base64.split(",");
        const mime = arr[0].match(/:(.*?);/)?.[1] || "image/png";
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);

        while (n--) {
          u8arr[n] = bstr.charCodeAt(n);
        }

        return new File([u8arr], filename, { type: mime });
      };

      profilePic.current = base64ToFile(croppedImage, selectedFile.name);
    }
  }, [croppedImage, selectedFile, profilePic]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setCroppedImage(null);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setCroppedImage(null);
    profilePic.current = null;
  };

  const AvatarBlock = ({ src }: { src?: string | null }) => (
    <div className="relative group w-fit">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
      <Avatar
        className="size-50 cursor-pointer rounded-full border shadow-2xl transition"
        onClick={() => fileInputRef.current?.click()}
      >
        <AvatarImage
          src={src ?? undefined}
          alt="profile"
          className="object-cover"
        />
        <AvatarFallback className="text-lg">CN</AvatarFallback>

        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-full">
          <Camera className="w-6 h-6 text-white" />
        </div>
      </Avatar>
    </div>
  );

  if (!selectedFile && !croppedImage) {
    return <AvatarBlock src={initialPicUrl} />;
  }

  if (croppedImage) {
    return <AvatarBlock src={croppedImage} />;
  }

  return (
    <div className="space-y-4">
      <ImageCrop
        aspect={1}
        file={selectedFile}
        maxImageSize={1024 * 1024}
        onCrop={setCroppedImage}
      >
        <ImageCropContent className="max-w-md" />
        <div className="flex items-center gap-2 mt-2">
          <ImageCropApply />
          <ImageCropReset />
          <Button onClick={handleReset} size="icon" variant="ghost">
            <XIcon className="size-4" />
          </Button>
        </div>
      </ImageCrop>
    </div>
  );
};

export default ProfileImage;
