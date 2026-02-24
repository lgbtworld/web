import type { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import WalletScreen from '../src/components/WalletScreen';
import { SSRPage, type SSRPageProps, createSSRPageProps } from '../lib/ssr-props';

export const getServerSideProps: GetServerSideProps<SSRPageProps> = async (context) => ({
  props: await createSSRPageProps(context, '/wallet'),
});

export default function Page(props: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <SSRPage {...props}>
      <WalletScreen />
    </SSRPage>
  );
}
