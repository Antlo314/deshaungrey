import Link from "next/link";
import { notFound } from "next/navigation";
import { Top } from "@/components/admin/Shell";
import { ConfirmForm } from "@/components/admin/Ui";
import { PostForm } from "@/components/admin/CatalogForms";
import { deletePostAction } from "@/lib/actions/admin";
import { getSession } from "@/lib/auth";
import { getPost } from "@/lib/db/repo";

export const metadata = { title: "Post" };

export default async function PostEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const isNew = id === "new";
  const [post, s] = await Promise.all([isNew ? null : getPost(id), getSession()]);
  if (!isNew && !post) notFound();
  return (
    <>
      <Top
        title={isNew ? "New post" : post!.title}
        sub={isNew ? "News & press" : post!.published ? "published" : "draft"}
        actions={
          <>
            <Link href="/admin/press" className="abtn ghost sm">
              ← News
            </Link>
            {!isNew && s?.role === "owner" ? (
              <ConfirmForm action={deletePostAction} message={`Delete “${post!.title}”?`} hidden={{ id: post!.id }}>
                <button className="abtn danger sm" type="submit">
                  Delete
                </button>
              </ConfirmForm>
            ) : null}
          </>
        }
      />
      <div className="adm-body">
        <div className="card">
          <div className="body">
            <PostForm post={post ?? undefined} author={s?.user.name || "MEG Enterprises"} />
          </div>
        </div>
      </div>
    </>
  );
}
