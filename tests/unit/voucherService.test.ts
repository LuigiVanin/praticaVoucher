import voucherService from "../../src/services/voucherService";
import voucherRepository from "../../src/repositories/voucherRepository";
import { faker } from "@faker-js/faker";
import { jest } from "@jest/globals";
import { conflictError } from "../../src/utils/errorUtils";

describe("voucherService test suite", () => {
    describe("teste unitário de serviço de criação de voucher", () => {
        jest.spyOn(
            voucherRepository,
            "getVoucherByCode"
        ).mockImplementationOnce(() => null);
        jest.spyOn(voucherRepository, "createVoucher").mockImplementationOnce(
            (code, discount) => {
                return null;
            }
        );
        it("teste deve ter sucesso com a criação de item", async () => {
            const voucher = {
                code: faker.random.alphaNumeric(10),
                discount: 89,
            };
            await voucherService.createVoucher(voucher.code, voucher.discount);
        });

        jest.spyOn(
            voucherRepository,
            "getVoucherByCode"
        ).mockImplementationOnce((code): any => {
            return { code, discount: 10 };
        });

        it("teste deve ter sucesso com a falha da criação, pois já existe voucher", async () => {
            const voucher = {
                code: faker.random.alphaNumeric(10),
                discount: 89,
            };
            try {
                await voucherService.createVoucher(
                    voucher.code,
                    voucher.discount
                );
                fail();
            } catch (e) {
                expect(e.type).toBe("conflict");
            }
        });
    });
    describe("teste unitário de aplicação de voucher", () => {
        jest.spyOn(
            voucherRepository,
            "getVoucherByCode"
        ).mockImplementationOnce((code): any => null);
        it("Testando o caso de voucher não existir => deve falhar", async () => {
            try {
                await voucherService.applyVoucher("1212", 65);
                fail();
            } catch (err) {
                expect(err.type).toBe("conflict");
            }
        });

        jest.spyOn(
            voucherRepository,
            "getVoucherByCode"
        ).mockImplementationOnce((code): any => ({
            code,
            discount: 10,
            used: false,
        }));
        jest.spyOn(voucherRepository, "useVoucher").mockImplementationOnce(
            (code): any => null
        );
        it("teste em que existe um voucher com o código e ele não foi usado", async () => {
            try {
                const amount = 100;
                const voucher = await voucherService.applyVoucher("1", amount);
                expect(voucher.amount).toBe(amount);
                expect(voucher.discount).toBe(10);
                expect(voucher.applied).toBe(true);
                expect(voucher.finalAmount).toBe(amount - (amount * 10) / 100);
            } catch (err) {
                console.log(err);
                fail();
            }
        });
    });
});
