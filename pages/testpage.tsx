import type { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import TestPage from '../src/components/TestPage';
import { SSRPage, type SSRPageProps, createSSRPageProps } from '../lib/ssr-props';

export const getServerSideProps: GetServerSideProps<SSRPageProps> = async (context) => ({
  props: await createSSRPageProps(context, '/testpage'),
});

export default function Page(props: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <SSRPage {...props}>
      <TestPage />
    </SSRPage>
  );
}
