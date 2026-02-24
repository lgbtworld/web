import type { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import ClassifiedsScreen from '../src/components/ClassifiedsScreen';
import { SSRPage, type SSRPageProps, createSSRPageProps } from '../lib/ssr-props';

export const getServerSideProps: GetServerSideProps<SSRPageProps> = async (context) => ({
  props: await createSSRPageProps(context, '/classifieds'),
});

export default function Page(props: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <SSRPage {...props}>
      <ClassifiedsScreen />
    </SSRPage>
  );
}
