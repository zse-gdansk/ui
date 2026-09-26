import {
    Badge,
    Button,
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    Skeleton,
    SkeletonText,
    Switch,
} from "@zse-gdansk/ui";
import { useState } from "react";

export function SkeletonDemo() {
    const [loading, setLoading] = useState(true);

    return (
        <section className="skeletons" aria-busy={loading}>
            <Switch
                label="Ładowanie"
                checked={loading}
                onCheckedChange={setLoading}
            />

            <div className="cards">
                <Card>
                    <CardHeader>
                        <CardTitle>
                            <Skeleton loading={loading}>
                                Sprawdzian z fizyki
                            </Skeleton>
                        </CardTitle>
                        <CardDescription>
                            <Skeleton loading={loading}>
                                Klasa 3C, 26 września, 28 uczniów
                            </Skeleton>
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <SkeletonText lines={3} />
                        ) : (
                            "Średnia 3,8. Oddane prace: 26 z 28. Dwie osoby mają przedłużony termin do poniedziałku, reszta prac jest już sprawdzona."
                        )}
                    </CardContent>
                    <CardContent>
                        <Skeleton loading={loading} radius="999px">
                            <Badge tone="success" dot>
                                Sprawdzone
                            </Badge>
                        </Skeleton>{" "}
                        <Skeleton loading={loading}>
                            <Button size="sm">Wystaw oceny</Button>
                        </Skeleton>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent>
                        <div className="skeleton-profile">
                            <Skeleton shape="circle" width={40} />
                            <div className="skeleton-profile-text">
                                <Skeleton shape="line" width="50%" />
                                <Skeleton shape="line" width="30%" />
                            </div>
                        </div>
                    </CardContent>
                    <CardContent>
                        <Skeleton height={120} />
                    </CardContent>
                    <CardContent>
                        <SkeletonText lines={2} animation="pulse" />
                    </CardContent>
                </Card>
            </div>
        </section>
    );
}
