"use client";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { AvatarInput } from "@/components/ui/avatar-input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";

const schema = z.object({ avatarUrl: z.string() });
type TSchema = z.infer<typeof schema>;

export default function Home() {
  const form = useForm<TSchema>({
    resolver: zodResolver(schema),
    defaultValues: { avatarUrl: "https://github.com/MiguelMelo.png" },
  });

  return (
    <main className="flex min-h-screen flex-col items-center p-24 gap-2 bg-zinc-900 text-white">
      <h1 className="text-2xl font-medium">AvatarInput</h1>

      <Card>
        <CardHeader>
          <CardTitle>Form</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((data) => console.log(data))}>
              <div className="grid grid-cols-12 gap-2">
                <div className="col-span-2">
                  <FormField
                    control={form.control}
                    name="avatarUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Foto</FormLabel>
                        <FormControl>
                          <AvatarInput {...field} />
                        </FormControl>
                        <FormDescription>
                          Esta é a foto do cliente.
                        </FormDescription>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="col-span-12">
                  <Button type="submit" variant="outline">
                    Salvar
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </main>
  );
}
