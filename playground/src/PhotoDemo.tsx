import { PhotoField, toast } from "@zse-gdansk/ui";

export function PhotoDemo() {
    return (
        <section className="photo-demo">
            <PhotoField
                label="Zdjęcie do legitymacji"
                hint="35 × 45 mm, twarz na środku, jasne tło."
                name="legitymacja"
                aspect={35 / 45}
                size={{ width: 413, height: 531 }}
                onChange={(file) =>
                    file &&
                    toast.success(
                        `Zapisano zdjęcie, ${Math.round(file.size / 1024)} KB`,
                    )
                }
            />
            <PhotoField
                label="Zdjęcie kandydata"
                name="kandydat"
                shape="circle"
                size={{ width: 400, height: 400 }}
            />
        </section>
    );
}
